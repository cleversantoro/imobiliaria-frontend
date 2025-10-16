import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { TranslationService } from '../../i18n/transloco';

const APP_NAME = 'Becarini Imoveis';

@Injectable()
export class TemplatePageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translation = inject(TranslationService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    const translated = routeTitle ? this.translation.t(routeTitle, routeTitle) : null;
    const finalTitle = translated ? `${translated} | ${APP_NAME}` : APP_NAME;
    this.title.setTitle(finalTitle);
  }
}