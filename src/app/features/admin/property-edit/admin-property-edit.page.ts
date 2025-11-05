import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { PropertyStore } from '../../../core/stores/property.store';
import { PropertyApiService } from '../../../core/services/property-api.service';
import { Property } from '../../../core/models/property.model';
import { extractHttpErrorMessage } from '../../../core/utils/http.utils';
import { TranslationService } from '../../../i18n/transloco';

const MAX_IMAGES_PER_PROPERTY = 10;

@Component({
  selector: 'app-admin-property-edit-page',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, CurrencyPipe, TranslatePipe],
  templateUrl: './admin-property-edit.page.html',
})
export class AdminPropertyEditPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly propertyStore = inject(PropertyStore);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly translation = inject(TranslationService);

  @ViewChild('fileInput', { static: false })
  private fileInput?: ElementRef<HTMLInputElement>;

  private subscription?: Subscription;

  protected readonly uploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly uploadSuccess = signal<string | null>(null);
  protected readonly selectedFiles = signal<File[]>([]);

  protected readonly MAX_IMAGES = MAX_IMAGES_PER_PROPERTY;

  private readonly syncSelectedProperty = effect(() => {
    const property = this.propertyStore.selectedProperty();
    if (!property) {
      this.selectedFiles.set([]);
    }
  });

  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      this.clearFeedback();
      this.selectedFiles.set([]);
      void this.propertyStore.loadProperty(id);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.syncSelectedProperty.destroy();
    this.propertyStore.clearSelectedProperty();
  }

  protected onFilesSelected(event: Event, property: Property | null): void {
    if (!property) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const remaining = this.getRemainingSlots(property);

    if (!files.length || remaining <= 0) {
      input.value = '';
      return;
    }

    const limited = files.slice(0, remaining);
    this.selectedFiles.set(limited);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);
    input.value = '';
  }

  protected removeSelectedFile(index: number): void {
    this.selectedFiles.update((files) => {
      if (index < 0 || index >= files.length) {
        return files;
      }

      const next = [...files];
      next.splice(index, 1);
      return next;
    });
  }

  protected async uploadSelectedFiles(property: Property | null): Promise<void> {
    if (!property) {
      return;
    }

    const files = this.selectedFiles();
    if (!files.length || this.uploading()) {
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    try {
      await firstValueFrom(this.propertyApi.uploadPropertyPhotos(property.id, files));
      this.uploadSuccess.set(this.translation.t('admin.propertyEdit.upload.success'));
      this.selectedFiles.set([]);
      this.resetFileInput();
      await this.propertyStore.loadProperty(property.id);
    } catch (error) {
      this.uploadError.set(extractHttpErrorMessage(error));
    } finally {
      this.uploading.set(false);
    }
  }

  protected getRemainingSlots(property: Property | null): number {
    const current = property?.images?.length ?? 0;
    return Math.max(0, MAX_IMAGES_PER_PROPERTY - current);
  }

  protected hasReachedLimit(property: Property | null): boolean {
    return this.getRemainingSlots(property) === 0;
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private clearFeedback(): void {
    this.uploadError.set(null);
    this.uploadSuccess.set(null);
  }
}
