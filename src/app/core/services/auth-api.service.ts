import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/auth/login', payload);
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/auth/refresh', { refreshToken });
  }

  logout(): Observable<ApiResponse<{ success: boolean }>> {
    return this.http.post<ApiResponse<{ success: boolean }>>(this.baseUrl + '/auth/logout', {});
  }
}
