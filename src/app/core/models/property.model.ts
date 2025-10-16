export type PropertyType = 'Casa' | 'Apartamento' | 'Terreno' | 'Comercial' | 'Rural';
export type TransactionType = 'Venda' | 'Aluguel';

export interface PropertyMedia {
  url: string;
  alt?: string;
}

export interface Property {
  id: number | string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  property_type: PropertyType | string;
  transaction_type: TransactionType | string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  garage_spaces?: number;
  features?: string[];
  images?: string[] | PropertyMedia[];
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyQuery {
  search?: string;
  type?: string;
  transaction?: string;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}
