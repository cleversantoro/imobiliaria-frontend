﻿import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PropertyApiService } from '../services/property-api.service';
import { Property, PropertyQuery } from '../models/property.model';
import { extractHttpErrorMessage } from '../utils/http.utils';

interface PropertyState {
  filters: PropertyQuery;
  total: number;
  lastUpdated?: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyStore {
  private readonly propertyApi = inject(PropertyApiService);

  private readonly propertiesSignal = signal<Property[]>([]);
  private readonly selectedPropertySignal = signal<Property | null>(null);
  private readonly featuredPropertiesSignal = signal<Property[]>([]);
  private readonly featuredLoadingSignal = signal(false);
  private readonly featuredErrorSignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly stateSignal = signal<PropertyState>({
    filters: { page: 1, limit: 12 },
    total: 0,
  });

  readonly properties = computed(() => this.propertiesSignal());
  readonly selectedProperty = computed(() => this.selectedPropertySignal());
  readonly featuredProperties = computed(() => this.featuredPropertiesSignal());
  readonly featuredLoading = computed(() => this.featuredLoadingSignal());
  readonly featuredError = computed(() => this.featuredErrorSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly filters = computed(() => this.stateSignal().filters);
  readonly total = computed(() => this.stateSignal().total);
  readonly hasData = computed(() => this.propertiesSignal().length > 0);

  async loadProperties(query: PropertyQuery = {}): Promise<void> {
    const mergedFilters = { ...this.filters(), ...query };
    this.updateState({ filters: mergedFilters });
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(this.propertyApi.getProperties(mergedFilters));
      this.propertiesSignal.set(response.data);
      this.updateState({ total: response.total, lastUpdated: new Date().toISOString() });
    } catch (error) {
      this.errorSignal.set(extractHttpErrorMessage(error));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadFeaturedProperties(query: PropertyQuery = {}): Promise<void> {
    this.featuredLoadingSignal.set(true);
    this.featuredErrorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.propertyApi.getProperties({ ...query, isFeatured: true, limit: query.limit ?? 6 }),
      );
      this.featuredPropertiesSignal.set(response.data);
    } catch (error) {
      this.featuredErrorSignal.set(extractHttpErrorMessage(error));
      this.featuredPropertiesSignal.set([]);
    } finally {
      this.featuredLoadingSignal.set(false);
    }
  }

  async loadProperty(id: string | number): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(this.propertyApi.getPropertyById(id));
      this.selectedPropertySignal.set(response.data);
    } catch (error) {
      this.errorSignal.set(extractHttpErrorMessage(error));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  updateFilters(partial: Partial<PropertyQuery>): void {
    const merged = { ...this.filters(), ...partial };
    this.updateState({ filters: merged });
  }

  clearSelectedProperty(): void {
    this.selectedPropertySignal.set(null);
  }

  reset(): void {
    this.propertiesSignal.set([]);
    this.selectedPropertySignal.set(null);
    this.featuredPropertiesSignal.set([]);
    this.updateState({ filters: { page: 1, limit: 12 }, total: 0, lastUpdated: undefined });
    this.errorSignal.set(null);
    this.featuredErrorSignal.set(null);
  }

  private updateState(partial: Partial<PropertyState>): void {
    this.stateSignal.update((current) => ({
      ...current,
      ...partial,
      filters: partial.filters ?? current.filters,
    }));
  }
}
