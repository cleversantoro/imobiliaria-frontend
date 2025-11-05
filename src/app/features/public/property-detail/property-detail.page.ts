import { Component, EffectRef, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { PropertyStore } from '../../../core/stores/property.store';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Property, PropertyMedia } from '../../../core/models/property.model';

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink, CurrencyPipe, TranslatePipe],
  templateUrl: './property-detail.page.html',
})
export class PropertyDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);
  protected readonly propertyStore = inject(PropertyStore);
  private subscription?: Subscription;

  protected readonly currentImageIndex = signal(0);

  private readonly syncImageIndexWithProperty: EffectRef = effect(() => {
    const property = this.propertyStore.selectedProperty();
    const images = property?.images ?? [];

    if (!images.length) {
      this.currentImageIndex.set(0);
      return;
    }

    if (this.currentImageIndex() >= images.length) {
      this.currentImageIndex.set(0);
    }
  });

  readonly propertyIdParam = this.route.paramMap;

  ngOnInit(): void {
    const appTitle = this.translation.t('app.title');
    const pageTitle = this.translation.t('route.property.detail');
    this.seo.update({
      title: `${pageTitle} | ${appTitle}`,
      description: this.translation.t('app.description'),
    });

    this.subscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        void this.propertyStore.loadProperty(id);
        this.currentImageIndex.set(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.syncImageIndexWithProperty.destroy();
  }

  protected getImageUrl(image?: PropertyMedia | string | null): string | null {
    if (!image) {
      return null;
    }

    return typeof image === 'string' ? image : image.url;
  }

  protected selectImage(index: number, total: number): void {
    if (index < 0 || index >= total) {
      return;
    }

    this.currentImageIndex.set(index);
  }

  protected nextImage(total: number): void {
    if (!total) {
      return;
    }

    this.currentImageIndex.update((current) => (current + 1) % total);
  }

  protected previousImage(total: number): void {
    if (!total) {
      return;
    }

    this.currentImageIndex.update((current) => (current - 1 + total) % total);
  }
}
