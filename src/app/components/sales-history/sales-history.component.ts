import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sale } from '../../models/sales.models';
import { SalesApiService } from '../../services/sales-api.service';

@Component({ selector: 'app-sales-history', templateUrl: './sales-history.component.html', styleUrls: ['./sales-history.component.scss'] })
export class SalesHistoryComponent implements OnInit {
  sales: Sale[] = [];
  loading = true;
  loadError = '';
  actionError = '';
  notice = '';
  search = new FormControl('', { nonNullable: true });
  dateFilter = new FormControl('', { nonNullable: true });
  expandedId: number | null = null;
  deletingId: number | null = null;
  confirmSale: Sale | null = null;
  constructor(private readonly salesApi: SalesApiService) { }
  ngOnInit(): void { this.loadSales(); }
  loadSales(): void {
    this.loading = true; this.loadError = '';
    this.salesApi.getSales().subscribe({
      next: sales => { this.sales = sales; this.loading = false; },
      error: () => { this.loadError = 'No se pudo cargar el historial. Comprueba la conexión con el servidor.'; this.loading = false; }
    });
  }
  get filteredSales(): Sale[] {
    const query = this.search.value.trim().toLowerCase(); const date = this.dateFilter.value;
    return this.sales.filter(sale => (!query || String(sale.id).includes(query) || sale.details.some(detail => (detail.product ?? '').toLowerCase().includes(query))) && (!date || sale.created_at === date));
  }
  get revenue(): number { return this.sales.reduce((sum, sale) => sum + Number(sale.total), 0); }
  get units(): number { return this.sales.reduce((sum, sale) => sum + sale.details.reduce((n, detail) => n + detail.quantity, 0), 0); }
  unitsIn(sale: Sale): number { return sale.details.reduce((sum, detail) => sum + detail.quantity, 0); }
  toggleDetails(id: number): void { this.expandedId = this.expandedId === id ? null : id; }
  requestDelete(sale: Sale): void { this.confirmSale = sale; }
  deleteConfirmed(): void {
    const sale = this.confirmSale; if (!sale || this.deletingId !== null) return;
    this.deletingId = sale.id; this.actionError = ''; this.notice = '';
    this.salesApi.deleteSale(sale.id).subscribe({
      next: response => {
        this.sales = this.sales.filter(item => item.id !== sale.id);
        this.notice = response.message;
        this.confirmSale = null;
        this.deletingId = null;
      },
      error: response => {
        this.confirmSale = null;
        this.deletingId = null;
        this.actionError = response.status === 404 ? 'Esta venta ya no está disponible en el historial.'
          : response.status === 409 ? 'No se pudo restituir el stock. La venta permanece sin cambios.'
            : 'No se pudo eliminar la venta. Inténtalo de nuevo.';
        if (response.status === 404) this.loadSales();
      }
    });
  }
}
