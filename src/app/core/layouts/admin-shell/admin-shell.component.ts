import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService, type AvailableLocale } from '../../../i18n/transloco';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, TranslatePipe],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  readonly navigation = [
    { label: 'admin.shell.menu.dashboard', path: '/admin' },
    { label: 'admin.shell.menu.properties', path: '/admin/imoveis' },
  ];

  readonly locales: { label: string; value: AvailableLocale }[] = [
    { label: 'PT', value: 'pt-BR' },
    { label: 'EN', value: 'en-US' },
  ];

  constructor(
    public readonly translationService: TranslationService,
    public readonly themeService: ThemeService,
  ) {}

  changeLocale(locale: AvailableLocale): void {
    this.translationService.setLocale(locale);
  }

  changeLocaleFromEvent(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.changeLocale(select.value as AvailableLocale);
    }
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}