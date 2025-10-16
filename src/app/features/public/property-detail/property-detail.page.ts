import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { PropertyStore } from '../../../core/stores/property.store';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Property } from '../../../core/models/property.model';

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
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected getPrimaryImage(property: Property): string | null {
    const images = property.images;
    if (!images?.length) {
      return null;
    }

    const [first] = images;
    return typeof first === 'string' ? first : first.url;
  }
}
