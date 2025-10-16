import { Component } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './app-footer.component.html',
})
export class AppFooterComponent {
  readonly currentYear = new Date().getFullYear();
}
