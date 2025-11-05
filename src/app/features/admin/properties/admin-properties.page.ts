import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PropertyStore } from '../../../core/stores/property.store';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-admin-properties-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink, TranslatePipe],
  templateUrl: './admin-properties.page.html',
})
export class AdminPropertiesPage implements OnInit {
  protected readonly propertyStore = inject(PropertyStore);

  ngOnInit(): void {
    void this.propertyStore.loadProperties({ limit: 20 });
  }

  refresh(): void {
    void this.propertyStore.loadProperties({ ...this.propertyStore.filters() });
  }
}
