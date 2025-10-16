import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { ContactFormComponent } from './components/contact-form.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ContactFormComponent],
  templateUrl: './contact.page.html',
})
export class ContactPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);

  ngOnInit(): void {
    this.seo.update({
      title: `${this.translation.t('route.contact')} | ${this.translation.t('app.title')}`,
      description: this.translation.t('contact.subtitle', this.translation.t('app.description')),
    });
  }
}
