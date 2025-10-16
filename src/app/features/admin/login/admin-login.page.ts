import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { SeoService } from '../../../core/services/seo.service';
import { TranslationService } from '../../../i18n/transloco';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-login.page.html',
})
export class AdminLoginPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translation = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.seo.update({
      title: `${this.translation.t('route.admin.login')} | ${this.translation.t('app.title')}`,
      description: this.translation.t('admin.login.subtitle'),
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.authStore.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    await this.authStore.login({
      username: this.form.value.username ?? '',
      password: this.form.value.password ?? '',
    });

    if (this.authStore.isAuthenticated()) {
      await this.router.navigateByUrl('/admin');
    }
  }

  hasError(controlName: 'username' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.invalid;
  }
}
