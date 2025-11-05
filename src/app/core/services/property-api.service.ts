import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  disponivel: 'Disponível',
  alugado: 'Alugado',
  vendido: 'Vendido',
};

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly collectionUrl = [this.baseUrl, 'imoveis'].join('/');

  getProperties(query: PropertyQuery = {}): Observable<Property[]> {
    const params = buildHttpParams(this.mapQueryToParams(query));

    return this.http
      .get<ImovelResponse[]>(this.collectionUrl, { params })
      .pipe(map((imoveis) => imoveis.map((imovel) => this.mapImovelToProperty(imovel))));
  }

  getPropertyById(id: string | number): Observable<Property> {
    return this.http
      .get<ImovelDetalheResponse>([this.collectionUrl, String(id)].join('/'))
      .pipe(map((imovel) => this.mapImovelDetalheToProperty(imovel)));
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
    const images: PropertyMedia[] =
      imovel.fotos?.map((foto) => ({
        url: foto.url,
        alt: foto.descricao ?? property.title,
      })) ?? [];

    return { ...property, images };
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

  private mapQueryToParams(query: PropertyQuery) {
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

  private normalizeType(type: Property['type']): string | undefined {
    if (!type) {
      return undefined;
    }

    const normalized = String(type).toLowerCase();
    const inverted = Object.entries(TYPE_VALUE_TO_LABEL).find(([, label]) => label.toLowerCase() === normalized);
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
    const inverted = Object.entries(STATUS_VALUE_TO_LABEL).find(([, label]) => label.toLowerCase() === normalized);
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
