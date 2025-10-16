import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about.page.html',
})
export class AboutPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);

  ngOnInit(): void {
    const appTitle = this.translation.t('app.title');
    const pageTitle = this.translation.t('route.about');
    this.seo.update({
      title: `${pageTitle} | ${appTitle}`,
      description: this.translation.t('about.subtitle', this.translation.t('app.description')),
    });
  }
}