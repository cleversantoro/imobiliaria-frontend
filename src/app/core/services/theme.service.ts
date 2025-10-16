import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'becarini.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  private readonly themeSignal = signal<Theme>('light');

  readonly theme = this.themeSignal.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    const stored = this.readStoredTheme();
    const initial = stored ?? (this.prefersDarkMode() ? 'dark' : 'light');
    this.applyTheme(initial);
  }

  toggle(): void {
    const next: Theme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  set(theme: Theme): void {
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    this.themeSignal.set(theme);

    if (!this.isBrowser) {
      return;
    }

    const root = document.documentElement;
    root.dataset['theme'] = theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage failures
    }
  }

  private readStoredTheme(): Theme | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }

  private prefersDarkMode(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
