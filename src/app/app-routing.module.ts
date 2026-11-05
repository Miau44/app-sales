import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { PosComponent } from './components/pos/pos.component';
import { SalesHistoryComponent } from './components/sales-history/sales-history.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Resumen' } },
  { path: 'products', component: ProductsComponent, data: { title: 'Productos' } },
  { path: 'sales/new', component: PosComponent, data: { title: 'Nueva venta' } },
  { path: 'sales/history', component: SalesHistoryComponent, data: { title: 'Historial de ventas' } },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', component: NotFoundComponent, data: { title: 'Página no encontrada' } }
];

@NgModule({ imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })], exports: [RouterModule] })
export class AppRoutingModule { }
