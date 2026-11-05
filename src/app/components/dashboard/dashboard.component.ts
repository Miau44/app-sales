import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Product, Sale } from '../../models/sales.models';
import { ProductsApiService } from '../../services/products-api.service';
import { SalesApiService } from '../../services/sales-api.service';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html', styleUrls: ['./dashboard.component.scss'] })
export class DashboardComponent implements OnInit {
  readonly today = new Date();
  products: Product[] = [];
  sales: Sale[] = [];
  loading = true;
  error = '';
  constructor(private readonly productsApi: ProductsApiService, private readonly salesApi: SalesApiService) { }
  ngOnInit(): void {
    forkJoin({ products: this.productsApi.getProducts(), sales: this.salesApi.getSales() }).subscribe({
      next: result => { this.products = result.products; this.sales = result.sales; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el resumen. Comprueba la conexión con el servidor.'; this.loading = false; }
    });
  }
  get revenue(): number { return this.sales.reduce((sum, sale) => sum + Number(sale.total), 0); }
  get unitsSold(): number { return this.sales.reduce((sum, sale) => sum + sale.details.reduce((n, detail) => n + detail.quantity, 0), 0); }
  get lowStock(): number { return this.products.filter(product => product.stock > 0 && product.stock <= 5).length; }
  get outOfStock(): number { return this.products.filter(product => product.stock === 0).length; }
  get missingImages(): number { return this.products.filter(product => !product.image?.trim()).length; }
  get recentSales(): Sale[] { return this.sales.slice(0, 4); }
  get chartSales(): Sale[] { return this.sales.slice(0, 6).reverse(); }
  get dashboardProducts(): Product[] { return this.products.slice(0, 4); }
  unitsIn(sale: Sale): number { return sale.details.reduce((sum, detail) => sum + detail.quantity, 0); }
  barHeight(sale: Sale): number { const max = Math.max(...this.chartSales.map(item => Number(item.total)), 1); return Math.max(7, Math.round((Number(sale.total) / max) * 100)); }
  stockPercent(count: number): number { return this.products.length ? Math.round(count / this.products.length * 100) : 0; }
}
