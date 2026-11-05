import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Product } from '../../models/sales.models';
import { ProductsApiService } from '../../services/products-api.service';

type StockFilter = 'all' | 'available' | 'low' | 'out';

@Component({ selector: 'app-products', templateUrl: './products.component.html', styleUrls: ['./products.component.scss'] })
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  search = new FormControl('', { nonNullable: true });
  stockFilter: StockFilter = 'all';
  loading = true;
  error = '';

  constructor(private readonly productsApi: ProductsApiService) { }

  ngOnInit(): void {
    this.productsApi.getProducts().subscribe({
      next: products => { this.products = products; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el inventario. Comprueba la conexión con el servidor.'; this.loading = false; }
    });
  }

  get filteredProducts(): Product[] {
    const query = this.search.value.trim().toLocaleLowerCase();
    return this.products.filter(product => {
      const matchesName = product.name.toLocaleLowerCase().includes(query);
      const matchesStock = this.stockFilter === 'all'
        || (this.stockFilter === 'available' && product.stock > 5)
        || (this.stockFilter === 'low' && product.stock > 0 && product.stock <= 5)
        || (this.stockFilter === 'out' && product.stock === 0);
      return matchesName && matchesStock;
    });
  }

  get withoutImageCount(): number { return this.products.filter(product => !product.image?.trim()).length; }
  stockLabel(stock: number): string { return stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock bajo' : 'Disponible'; }
  stockClass(stock: number): string { return stock === 0 ? 'status-out' : stock <= 5 ? 'status-low' : 'status-available'; }
}
