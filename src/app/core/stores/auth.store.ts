import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '../services/auth-api.service';
import { AdminUser, AuthResponse, LoginRequest } from '../models/auth.model';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { extractHttpErrorMessage } from '../utils/http.utils';
import { readFromStorage, writeToStorage } from '../utils/storage.utils';

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApiService);

  private readonly stateSignal = signal<AuthState>({
    user: null,
    accessToken: readFromStorage<string>(STORAGE_KEYS.authToken),
    refreshToken: readFromStorage<string>(STORAGE_KEYS.refreshToken),
  });
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly user = computed(() => this.stateSignal().user);
  readonly accessToken = computed(() => this.stateSignal().accessToken);
  readonly refreshToken = computed(() => this.stateSignal().refreshToken);
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAuthenticated = computed(() => Boolean(this.stateSignal().accessToken));

  constructor() {
    const storedUser = readFromStorage<AdminUser>(STORAGE_KEYS.authUser);
    if (storedUser) {
      this.stateSignal.update((state) => ({ ...state, user: storedUser }));
    }
  }

  async login(payload: LoginRequest): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(this.authApi.login(payload));
      this.persistAuthResponse(response);
    } catch (error) {
      this.errorSignal.set(extractHttpErrorMessage(error));
      this.clearPersistedState();
      this.stateSignal.set({ user: null, accessToken: null, refreshToken: null });
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async refresh(): Promise<void> {
    const refreshToken = this.stateSignal().refreshToken;
    if (!refreshToken) {
      return;
    }

    try {
      const response = await firstValueFrom(this.authApi.refresh(refreshToken));
      this.persistAuthResponse(response, { preserveUser: true });
    } catch (error) {
      this.errorSignal.set(extractHttpErrorMessage(error));
      this.logout();
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } catch {
      // Mesmo que a API falhe, garantimos que o estado local seja limpo.
    } finally {
      this.clearPersistedState();
      this.stateSignal.set({ user: null, accessToken: null, refreshToken: null });
      this.errorSignal.set(null);
    }
  }

  private persistAuthResponse(response: AuthResponse, options: { preserveUser?: boolean } = {}): void {
    const { tokens, user } = response;
    const nextUser = options.preserveUser ? this.stateSignal().user ?? user : user;

    this.stateSignal.set({
      user: nextUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
    });

    writeToStorage(STORAGE_KEYS.authToken, tokens.accessToken);
    writeToStorage(STORAGE_KEYS.refreshToken, tokens.refreshToken ?? null);
    writeToStorage(STORAGE_KEYS.authUser, nextUser);
  }

  private clearPersistedState(): void {
    writeToStorage(STORAGE_KEYS.authToken, null);
    writeToStorage(STORAGE_KEYS.refreshToken, null);
    writeToStorage(STORAGE_KEYS.authUser, null);
  }
}
