import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ContactApiService } from '../services/contact-api.service';
import { ContactRequest, ContactSubmissionState } from '../models/contact.model';
import { extractHttpErrorMessage } from '../utils/http.utils';

@Injectable({ providedIn: 'root' })
export class ContactStore {
  private readonly contactApi = inject(ContactApiService);

  private readonly sendingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastSubmissionSignal = signal<ContactSubmissionState | null>(null);

  readonly sending = computed(() => this.sendingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly lastSubmission = computed(() => this.lastSubmissionSignal());
  readonly success = computed(() => this.lastSubmissionSignal()?.success ?? false);

  async submit(payload: ContactRequest): Promise<void> {
    this.sendingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(this.contactApi.submit(payload));
      this.lastSubmissionSignal.set(response.data ?? { success: true });
    } catch (error) {
      this.errorSignal.set(extractHttpErrorMessage(error));
      this.lastSubmissionSignal.set({ success: false });
    } finally {
      this.sendingSignal.set(false);
    }
  }

  reset(): void {
    this.sendingSignal.set(false);
    this.errorSignal.set(null);
    this.lastSubmissionSignal.set(null);
  }
}
