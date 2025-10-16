import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-dashboard.page.html',
})
export class AdminDashboardPage {}
