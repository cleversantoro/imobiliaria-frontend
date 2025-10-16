import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Property, PropertyQuery } from '../models/property.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { buildHttpParams } from '../utils/http.utils';

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly collectionUrl = [this.baseUrl, 'properties'].join('/');

  getProperties(query: PropertyQuery = {}): Observable<PaginatedResponse<Property>> {
    const params = buildHttpParams({ ...query });
    return this.http.get<PaginatedResponse<Property>>(this.collectionUrl, { params });
  }

  getPropertyById(id: string | number): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>([this.collectionUrl, String(id)].join('/'));
  }

  createProperty(payload: Partial<Property>): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(this.collectionUrl, payload);
  }

  updateProperty(id: string | number, payload: Partial<Property>): Observable<ApiResponse<Property>> {
    return this.http.put<ApiResponse<Property>>([this.collectionUrl, String(id)].join('/'), payload);
  }

  deleteProperty(id: string | number): Observable<ApiResponse<{ id: string | number }>> {
    return this.http.delete<ApiResponse<{ id: string | number }>>([this.collectionUrl, String(id)].join('/'));
  }
}
