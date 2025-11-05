export type PropertyType = 'Casa' | 'Apartamento' | 'Terreno' | 'Comercial';
export type PropertyStatus = 'Disponível' | 'Alugado' | 'Vendido';

export interface PropertyMedia {
  url: string;
  alt?: string;
}

export interface Property {
  id: number | string;
  title: string;
  description?: string | null;
  price: number;
  currency?: string;
  type: PropertyType | string;
  status: PropertyStatus | string;
  address?: string | null;
  cityId?: number | null;
  city?: string | null;
  state?: string | null;
  categoryId?: number | null;
  category?: string | null;
  images?: PropertyMedia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyQuery {
  search?: string;
  categoryId?: number;
  cityId?: number;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}
