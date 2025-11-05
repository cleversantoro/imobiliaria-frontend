import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Property, PropertyMedia, PropertyQuery, PropertyStatus, PropertyType } from '../models/property.model';
import { buildHttpParams } from '../utils/http.utils';

interface ImovelResponse {
  id: number;
  titulo: string;
  descricao: string | null;
  tipo: string;
  categoria_id: number | null;
  categoria_nome: string | null;
  cidade_id: number | null;
  cidade_nome: string | null;
  cidade_estado: string | null;
  endereco: string | null;
  valor: number | string;
  status: string;
  criado_em?: string;
  atualizado_em?: string | null;
}

interface ImovelDetalheResponse extends ImovelResponse {
  fotos?: FotoResponse[];
}

interface FotoResponse {
  id: number;
  url: string;
  descricao: string | null;
}

interface PropertyPhotosResponse {
  fotos?: PropertyPhotoResponse[];
}

interface PropertyPhotoResponse {
  id?: number;
  imovel_id?: number;
  filename?: string;
  url: string;
  originalName?: string | null;
  descricao?: string | null;
  size?: number;
}

interface ImovelPayload {
  titulo?: string;
  descricao?: string | null;
  tipo?: string;
  categoria_id?: number | null;
  cidade_id?: number | null;
  endereco?: string | null;
  valor?: number;
  status?: string;
}

const TYPE_VALUE_TO_LABEL: Record<string, PropertyType> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
};

const STATUS_VALUE_TO_LABEL: Record<string, PropertyStatus> = {
  disponivel: 'Disponivel',
  alugado: 'Alugado',
  vendido: 'Vendido',
};

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly collectionUrl = [this.baseUrl, 'imoveis'].join('/');
  private readonly assetBaseUrl = this.computeAssetBaseUrl(this.baseUrl);

  getProperties(query: PropertyQuery = {}): Observable<Property[]> {
    const params = buildHttpParams(this.mapQueryToParams(query));

    return this.http.get<ImovelResponse[]>(this.collectionUrl, { params }).pipe(
      switchMap((imoveis) => {
        if (!imoveis.length) {
          return of([]);
        }

        const baseProperties = imoveis.map((imovel) => this.mapImovelToProperty(imovel));

        const limit = typeof query.limit === 'number' && query.limit > 0 ? query.limit : baseProperties.length;
        const propertiesToEnhance = baseProperties.slice(0, limit);

        if (!propertiesToEnhance.length) {
          return of(baseProperties);
        }

        const enhancements$ = propertiesToEnhance.map((property) =>
          this.fetchPropertyPhotos(String(property.id)).pipe(
            catchError(() => of([])),
            map((photos) => (photos.length ? { ...property, images: photos } : property)),
          ),
        );

        return forkJoin(enhancements$).pipe(
          map((enhancedProperties) => {
            const merged = [...baseProperties];

            enhancedProperties.forEach((enhanced) => {
              const targetIndex = merged.findIndex((item) => item.id === enhanced.id);
              if (targetIndex !== -1) {
                merged[targetIndex] = enhanced;
              }
            });

            return merged;
          }),
        );
      }),
    );
  }

  getPropertyById(id: string | number): Observable<Property> {
    const url = [this.collectionUrl, String(id)].join('/');
    return this.http.get<ImovelDetalheResponse>(url).pipe(
      switchMap((imovel) => {
        const property = this.mapImovelDetalheToProperty(imovel);
        return this.fetchPropertyPhotos(String(id)).pipe(
          map((photos) => (photos.length ? { ...property, images: photos } : property)),
          catchError(() => of(property)),
        );
      }),
    );
  }

  createProperty(payload: Partial<Property>): Observable<Property> {
    const body = this.mapPropertyToPayload(payload);
    return this.http
      .post<ImovelDetalheResponse>(this.collectionUrl, body)
      .pipe(map((imovel) => this.mapImovelDetalheToProperty(imovel)));
  }

  updateProperty(id: string | number, payload: Partial<Property>): Observable<Property> {
    const body = this.mapPropertyToPayload(payload);
    return this.http
      .put<ImovelDetalheResponse>([this.collectionUrl, String(id)].join('/'), body)
      .pipe(map((imovel) => this.mapImovelDetalheToProperty(imovel)));
  }

  deleteProperty(id: string | number): Observable<void> {
    return this.http.delete<void>([this.collectionUrl, String(id)].join('/'));
  }

  uploadPropertyPhotos(id: string | number, files: File[]): Observable<PropertyMedia[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('fotos', file));

    const url = [this.collectionUrl, String(id), 'fotos'].join('/');
    return this.http.post<PropertyPhotosResponse>(url, formData).pipe(
      map((response) => this.mapPhotosResponseToMedia(response, String(id))),
    );
  }

  private fetchPropertyPhotos(id: string): Observable<PropertyMedia[]> {
    const url = [this.collectionUrl, id, 'fotos'].join('/');
    return this.http.get<PropertyPhotosResponse>(url).pipe(
      map((response) => this.mapPhotosResponseToMedia(response, id)),
    );
  }

  private mapImovelToProperty(imovel: ImovelResponse): Property {
    return {
      id: imovel.id,
      title: imovel.titulo,
      description: imovel.descricao ?? null,
      price: Number(imovel.valor),
      currency: 'BRL',
      type: TYPE_VALUE_TO_LABEL[imovel.tipo] ?? this.capitalize(imovel.tipo),
      status: STATUS_VALUE_TO_LABEL[imovel.status] ?? this.capitalize(imovel.status),
      categoryId: imovel.categoria_id,
      category: imovel.categoria_nome,
      cityId: imovel.cidade_id,
      city: imovel.cidade_nome,
      state: imovel.cidade_estado,
      address: imovel.endereco,
      images: [],
      createdAt: imovel.criado_em,
      updatedAt: imovel.atualizado_em ?? undefined,
    };
  }

  private mapImovelDetalheToProperty(imovel: ImovelDetalheResponse): Property {
    const property = this.mapImovelToProperty(imovel);
    const images = imovel.fotos?.map((foto) => ({
      url: this.resolvePhotoUrl(foto.url),
      alt: foto.descricao ?? property.title,
    }));

    return images?.length ? { ...property, images } : property;
  }

  private mapPropertyToPayload(payload: Partial<Property>): ImovelPayload {
    return {
      titulo: payload.title,
      descricao: payload.description ?? null,
      tipo: payload.type ? this.normalizeType(payload.type) : undefined,
      categoria_id: payload.categoryId ?? null,
      cidade_id: payload.cityId ?? null,
      endereco: payload.address ?? null,
      valor: payload.price,
      status: payload.status ? this.normalizeStatus(payload.status) : undefined,
    };
  }

  private mapQueryToParams(query: PropertyQuery): Record<string, unknown> {
    return {
      busca: query.search,
      tipo: query.type ? this.normalizeType(query.type) : undefined,
      status: query.status ? this.normalizeStatus(query.status) : undefined,
      categoria_id: query.categoryId,
      cidade_id: query.cityId,
      valor_min: query.minPrice,
      valor_max: query.maxPrice,
    };
  }

  private mapPhotosResponseToMedia(
    response: PropertyPhotosResponse | null,
    fallbackTitle: string,
  ): PropertyMedia[] {
    if (!response?.fotos?.length) {
      return [];
    }

    return response.fotos
      .filter((foto) => !!foto?.url)
      .map((foto) => ({
        url: this.resolvePhotoUrl(foto.url),
        alt: foto.descricao ?? foto.originalName ?? fallbackTitle,
      }));
  }

  private computeAssetBaseUrl(baseUrl: string): string {
    try {
      const parsed = new URL(baseUrl);
      return parsed.origin.replace(/\/$/, '');
    } catch {
      return '';
    }
  }

  private resolvePhotoUrl(url: string): string {
    if (!url) {
      return url;
    }

    if (/^(https?:)?\/\//i.test(url)) {
      return url;
    }

    if (!this.assetBaseUrl) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${this.assetBaseUrl}${url}`;
    }

    return `${this.assetBaseUrl}/${url}`;
  }

  private normalizeType(type: Property['type']): string | undefined {
    if (!type) {
      return undefined;
    }

    const normalized = String(type).toLowerCase();
    const inverted = Object.entries(TYPE_VALUE_TO_LABEL).find(
      ([, label]) => label.toLowerCase() === normalized,
    );
    if (inverted) {
      return inverted[0];
    }

    return normalized;
  }

  private normalizeStatus(status: Property['status']): string | undefined {
    if (!status) {
      return undefined;
    }

    const normalized = String(status).toLowerCase();
    const inverted = Object.entries(STATUS_VALUE_TO_LABEL).find(
      ([, label]) => label.toLowerCase() === normalized,
    );
    if (inverted) {
      return inverted[0];
    }

    return normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    const lower = value.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}
