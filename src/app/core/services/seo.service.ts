import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private readonly title: Title, private readonly meta: Meta) {}

  update(config: { title?: string; description?: string; ogImage?: string }): void {
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
      this.meta.updateTag({ name: 'twitter:image', content: config.ogImage });
    }
  }
}
