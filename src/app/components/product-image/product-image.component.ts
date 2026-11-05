import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-image',
  templateUrl: './product-image.component.html',
  styleUrls: ['./product-image.component.scss']
})
export class ProductImageComponent implements OnChanges {
  @Input() image: string | null = null;
  @Input() alt = 'Imagen de producto';
  failed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['image']) this.failed = false;
  }

  get source(): string | null {
    if (!this.image || this.failed) return null;
    const value = this.image.trim();
    if (!value) return null;
    try {
      const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
      const base = `${apiRoot}/`;
      const resolved = /^https?:\/\//i.test(value)
        ? new URL(value)
        : value.startsWith('/')
          ? new URL(value, base)
          : new URL(value.startsWith('storage/') ? value : `storage/${value}`, base);
      return ['http:', 'https:'].includes(resolved.protocol) ? resolved.toString() : null;
    } catch {
      return null;
    }
  }

  markFailed(): void { this.failed = true; }
}
