import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { SalesHistoryComponent } from './components/sales-history/sales-history.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PosComponent } from './components/pos/pos.component';
import { ProductImageComponent } from './components/product-image/product-image.component';
import { ThreeDTiltDirective } from './directives/three-d-tilt.directive';

registerLocaleData(localeEs, 'es-BO');

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ProductsComponent,
    SalesHistoryComponent,
    NotFoundComponent,
    PosComponent,
    ProductImageComponent,
    ThreeDTiltDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-BO' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
