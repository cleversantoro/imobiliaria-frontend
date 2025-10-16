import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { PropertyStore } from '../../../core/stores/property.store';
import { Property, PropertyQuery, PropertyType, TransactionType } from '../../../core/models/property.model';

@Component({
  selector: 'app-properties-list-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink, CurrencyPipe, TranslatePipe, ReactiveFormsModule],
  templateUrl: './properties-list.page.html',
})
export class PropertiesListPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  protected readonly propertyStore = inject(PropertyStore);
  protected readonly propertyTypes: PropertyType[] = ['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Rural'];
  protected readonly transactionTypes: TransactionType[] = ['Venda', 'Aluguel'];
  protected readonly filtersForm = this.fb.group({
    search: [''],
    city: [''],
    neighborhood: [''],
    type: [''],
    transaction: [''],
    minPrice: [''],
    maxPrice: [''],
    bedrooms: [''],
    bathrooms: [''],
  });

  ngOnInit(): void {
    const appTitle = this.translation.t('app.title');
    const pageTitle = this.translation.t('route.properties');
    this.seo.update({
      title: `${pageTitle} | ${appTitle}`,
      description: this.translation.t('app.description'),
    });

    const filters = this.propertyStore.filters();
    this.filtersForm.patchValue({
      search: filters.search ?? '',
      city: filters.city ?? '',
      neighborhood: filters.neighborhood ?? '',
      type: filters.type ?? '',
      transaction: filters.transaction ?? '',
      minPrice: filters.minPrice?.toString() ?? '',
      maxPrice: filters.maxPrice?.toString() ?? '',
      bedrooms: filters.bedrooms?.toString() ?? '',
      bathrooms: filters.bathrooms?.toString() ?? '',
    });

    void this.propertyStore.loadProperties();
  }

  refresh(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.buildQueryFromForm();
    void this.propertyStore.loadProperties({ page: 1, ...query });
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      city: '',
      neighborhood: '',
      type: '',
      transaction: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
    });
    this.applyFilters();
  }

  protected getPrimaryImage(property: Property): string | null {
    const images = property.images;
    if (!images?.length) {
      return null;
    }

    const [first] = images;
    return typeof first === 'string' ? first : first.url;
  }

  private buildQueryFromForm(): PropertyQuery {
    const formValue = this.filtersForm.value;

    const toStringOrUndefined = (value?: string | null) => {
      if (!value) {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    };

    const toNumberOrUndefined = (value?: string | null) => {
      if (value === null || value === undefined || value === '') {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const query: PropertyQuery = {
      search: toStringOrUndefined(formValue.search),
      city: toStringOrUndefined(formValue.city),
      neighborhood: toStringOrUndefined(formValue.neighborhood),
      type: toStringOrUndefined(formValue.type),
      transaction: toStringOrUndefined(formValue.transaction),
      minPrice: toNumberOrUndefined(formValue.minPrice),
      maxPrice: toNumberOrUndefined(formValue.maxPrice),
      bedrooms: toNumberOrUndefined(formValue.bedrooms),
      bathrooms: toNumberOrUndefined(formValue.bathrooms),
    };

    return query;
  }
}
