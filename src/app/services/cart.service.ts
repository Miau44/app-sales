import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/sales.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] { return this.itemsSubject.value; }
  get count(): number { return this.items.reduce((sum, item) => sum + item.quantity, 0); }
  get total(): number { return this.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0); }
  get hasStockIssues(): boolean { return this.items.some(item => item.product.stock < item.quantity || item.product.stock < 1); }

  add(product: Product): boolean {
    if (product.stock < 1) return false;
    const items = [...this.items];
    const existing = items.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return false;
      existing.quantity += 1;
      existing.product = product;
    } else {
      items.push({ product, quantity: 1 });
    }
    this.itemsSubject.next(items);
    return true;
  }

  setQuantity(productId: number, quantity: number): void {
    const items = this.items
      .map(item => item.product.id === productId
        ? { ...item, quantity: Math.min(Math.max(1, item.product.stock), Math.max(1, Math.floor(quantity) || 1)) }
        : item);
    this.itemsSubject.next(items);
  }

  refreshProducts(products: Product[]): void {
    const byId = new Map(products.map(product => [product.id, product]));
    this.itemsSubject.next(this.items.map(item => ({ ...item, product: byId.get(item.product.id) ?? item.product })));
  }

  remove(productId: number): void { this.itemsSubject.next(this.items.filter(item => item.product.id !== productId)); }
  clear(): void { this.itemsSubject.next([]); }
}
