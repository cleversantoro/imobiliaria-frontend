import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ContactRequest, ContactSubmissionState } from '../models/contact.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = [environment.apiBaseUrl, 'contact'].join('/');

  submit(payload: ContactRequest): Observable<ApiResponse<ContactSubmissionState>> {
    return this.http.post<ApiResponse<ContactSubmissionState>>(this.endpoint, payload);
  }
}
