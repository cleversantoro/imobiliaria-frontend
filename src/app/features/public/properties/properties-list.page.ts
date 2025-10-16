import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { PropertyStore } from '../../../core/stores/property.store';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-properties-list-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink, CurrencyPipe, TranslatePipe],
  templateUrl: './properties-list.page.html',
})
export class PropertiesListPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);
  protected readonly propertyStore = inject(PropertyStore);

  ngOnInit(): void {
    const appTitle = this.translation.t('app.title');
    const pageTitle = this.translation.t('route.properties');
    this.seo.update({
      title: `${pageTitle} | ${appTitle}`,
      description: this.translation.t('app.description'),
    });

    void this.propertyStore.loadProperties();
  }

  refresh(): void {
    void this.propertyStore.loadProperties({ page: 1 });
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
