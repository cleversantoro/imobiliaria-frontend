import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, AppFooterComponent],
  templateUrl: './site-shell.component.html',
})
export class SiteShellComponent {}
