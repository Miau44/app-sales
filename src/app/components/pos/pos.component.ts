import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../models/sales.models';
import { CartService } from '../../services/cart.service';
import { ProductsApiService } from '../../services/products-api.service';
import { SalesApiService } from '../../services/sales-api.service';

@Component({ selector: 'app-pos', templateUrl: './pos.component.html', styleUrls: ['./pos.component.scss'] })
export class PosComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  products: Product[] = [];
  search = new FormControl('', { nonNullable: true });
  cartItems = this.cart.items;
  loading = true;
  submitting = false;
  error = '';
  notice = '';

  constructor(readonly cart: CartService, private readonly productsApi: ProductsApiService, private readonly salesApi: SalesApiService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.cart.items$.pipe(takeUntil(this.destroyed$)).subscribe(items => this.cartItems = items);
  }

  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  loadProducts(): void {
    this.productsApi.getProducts().subscribe({
      next: products => { this.products = products; this.cart.refreshProducts(products); this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el catálogo para la venta.'; this.loading = false; }
    });
  }

  get filteredProducts(): Product[] {
    const query = this.search.value.trim().toLocaleLowerCase();
    return this.products.filter(product => product.name.toLocaleLowerCase().includes(query));
  }

  add(product: Product): void {
    this.error = '';
    if (!this.cart.add(product)) this.error = `La cantidad solicitada supera el stock de ${product.name}.`;
  }

  lineTotal(price: string | number, quantity: number): number { return Number(price) * quantity; }

  submitSale(): void {
    if (!this.cart.items.length || this.submitting) return;
    this.error = ''; this.notice = ''; this.submitting = true;
    this.salesApi.createSale({ items: this.cart.items.map(item => ({ product_id: item.product.id, quantity: item.quantity })) }).subscribe({
      next: response => {
        this.cart.clear(); this.submitting = false;
        this.notice = `Venta #${response.sale_id} confirmada · ${Number(response.total).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.loadProducts();
      },
      error: response => {
        this.submitting = false;
        this.error = response.status === 422 ? 'No se pudo completar la venta. Verifica el stock disponible.'
          : response.status === 409 ? 'El usuario de ventas no está disponible. Contacta al administrador.'
            : 'No se pudo completar la venta. Inténtalo de nuevo.';
      }
    });
  }
}
