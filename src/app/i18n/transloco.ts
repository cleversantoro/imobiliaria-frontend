import { APP_INITIALIZER, FactoryProvider, Injectable, Provider, computed, signal, inject } from '@angular/core';

import { enUS } from './locales/en-US';
import { ptBR } from './locales/pt-BR';

export type AvailableLocale = 'pt-BR' | 'en-US';

export interface TranslationResources {
  [key: string]: string;
}

const LOCALE_MAP: Record<AvailableLocale, TranslationResources> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionary = new Map<AvailableLocale, TranslationResources>();
  private readonly localeSignal = signal<AvailableLocale>('pt-BR');

  readonly locale = this.localeSignal.asReadonly();

  async load(locale: AvailableLocale): Promise<void> {
    if (!this.dictionary.has(locale)) {
      const resources = LOCALE_MAP[locale];
      if (resources) {
        this.dictionary.set(locale, resources);
      }
    }
    this.localeSignal.set(locale);
  }

  async setLocale(locale: AvailableLocale): Promise<void> {
    await this.load(locale);
  }

  t(key: string, defaultValue?: string): string {
    const resources = this.dictionary.get(this.localeSignal());
    if (!resources) {
      return defaultValue ?? key;
    }
    return resources[key] ?? resources[key.toLowerCase()] ?? defaultValue ?? key;
  }
}

export function provideTranslation(initialLocale: AvailableLocale = 'pt-BR'): Provider[] {
  return [
    TranslationService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const translationService = inject(TranslationService);
        return () => translationService.load(initialLocale);
      },
    } satisfies FactoryProvider,
  ];
}