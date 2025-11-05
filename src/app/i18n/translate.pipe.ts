import { ChangeDetectorRef, Pipe, PipeTransform, effect, inject } from '@angular/core';

import { TranslationService } from './transloco';

@Pipe({
  name: 't',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.translationService.locale();
      this.cdr.markForCheck();
    });
  }

  transform(
    key: string,
    arg?: string | Record<string, unknown> | null,
    params?: Record<string, unknown>,
  ): string {
    if (arg && typeof arg === 'object') {
      return this.translationService.t(key, undefined, arg);
    }

    return this.translationService.t(key, arg ?? undefined, params);
  }
}
