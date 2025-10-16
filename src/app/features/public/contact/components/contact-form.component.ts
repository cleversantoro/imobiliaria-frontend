import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslationService, type AvailableLocale } from '../../../../i18n/transloco';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { ContactStore } from '../../../../core/stores/contact.store';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact-form.component.html',
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly contactStore = inject(ContactStore);
  readonly translationService = inject(TranslationService);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    subject: ['contact.form.subject.purchase'],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    effect(() => {
      if (this.contactStore.success()) {
        this.form.reset({ subject: 'contact.form.subject.purchase' });
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.contactStore.sending()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.value.name?.trim() ?? '',
      email: this.form.value.email?.trim() ?? '',
      phone: this.form.value.phone?.trim() ?? '',
      subject: this.translationService.t(this.form.value.subject ?? 'contact.form.subject.other'),
      message: this.form.value.message ?? '',
    };

    void this.contactStore.submit(payload);
  }

  hasError(controlName: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(error);
  }
}
