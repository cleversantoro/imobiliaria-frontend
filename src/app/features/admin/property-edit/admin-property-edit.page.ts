import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-admin-property-edit-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-property-edit.page.html',
})
export class AdminPropertyEditPage {
  private readonly route = inject(ActivatedRoute);
  readonly params$ = this.route.paramMap;
}
