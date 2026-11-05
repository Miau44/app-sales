import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Sale } from '../../models/sales.models';
import { SalesApiService } from '../../services/sales-api.service';
import { SalesHistoryComponent } from './sales-history.component';

const existingSale: Sale = { id: 42, total: 95, created_at: '2026-11-05', details: [] };

describe('SalesHistoryComponent action and loading errors', () => {
  function createFixture(api: Partial<SalesApiService>): { fixture: ComponentFixture<SalesHistoryComponent>; api: Partial<SalesApiService> } {
    TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [SalesHistoryComponent],
      providers: [{ provide: SalesApiService, useValue: api }]
    });
    const fixture = TestBed.createComponent(SalesHistoryComponent);
    fixture.detectChanges();
    return { fixture, api };
  }

  it('keeps the delete 404 message after a successful list refresh', () => {
    const api = {
      getSales: jasmine.createSpy().and.returnValues(of([existingSale]), of([])),
      deleteSale: jasmine.createSpy().and.returnValue(throwError(() => ({ status: 404 })))
    };
    const { fixture } = createFixture(api);
    const component = fixture.componentInstance;

    component.requestDelete(existingSale);
    component.deleteConfirmed();
    fixture.detectChanges();

    expect(component.actionError).toBe('Esta venta ya no está disponible en el historial.');
    expect(component.loadError).toBe('');
    expect(component.sales).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Esta venta ya no está disponible en el historial.');
  });

  it('keeps the delete 404 and reports a separate refresh failure', () => {
    const api = {
      getSales: jasmine.createSpy().and.returnValues(of([existingSale]), throwError(() => new Error('offline'))),
      deleteSale: jasmine.createSpy().and.returnValue(throwError(() => ({ status: 404 })))
    };
    const { fixture } = createFixture(api);
    const component = fixture.componentInstance;

    component.requestDelete(existingSale);
    component.deleteConfirmed();
    fixture.detectChanges();

    expect(component.actionError).toBe('Esta venta ya no está disponible en el historial.');
    expect(component.loadError).toBe('No se pudo cargar el historial. Comprueba la conexión con el servidor.');
  });

  it('keeps the sales list and displays the 409 action error', () => {
    const api = {
      getSales: jasmine.createSpy().and.returnValue(of([existingSale])),
      deleteSale: jasmine.createSpy().and.returnValue(throwError(() => ({ status: 409 })))
    };
    const { fixture } = createFixture(api);
    const component = fixture.componentInstance;

    component.requestDelete(existingSale);
    component.deleteConfirmed();
    fixture.detectChanges();

    expect(component.actionError).toBe('No se pudo restituir el stock. La venta permanece sin cambios.');
    expect(component.sales).toEqual([existingSale]);
    expect(api.getSales).toHaveBeenCalledTimes(1);
  });
});
