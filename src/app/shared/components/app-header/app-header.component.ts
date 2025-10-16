import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService, AvailableLocale } from '../../../i18n/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, NgFor, TranslatePipe],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  readonly navigation = [
    { label: 'navigation.home', path: '/' },
    { label: 'navigation.properties', path: '/imoveis' },
    { label: 'navigation.about', path: '/sobre' },
    { label: 'navigation.contact', path: '/contato' },
  ];

  readonly locales: { label: string; value: AvailableLocale }[] = [
    { label: 'PT', value: 'pt-BR' },
    { label: 'EN', value: 'en-US' },
  ];

  protected readonly isMenuOpen = signal(false);

  constructor(
    public readonly themeService: ThemeService,
    public readonly translationService: TranslationService,
  ) {}

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  changeLocale(locale: AvailableLocale): void {
    this.translationService.setLocale(locale);
  }

  changeLocaleFromEvent(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.changeLocale(select.value as AvailableLocale);
    }
  }
}