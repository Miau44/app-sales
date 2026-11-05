import { of } from 'rxjs';
import { Product } from '../../models/sales.models';
import { CartService } from '../../services/cart.service';
import { PosComponent } from './pos.component';

describe('PosComponent', () => {
  it('sends only product IDs and quantities to the sales endpoint', () => {
    const product: Product = { id: 3, name: 'Monitor', price: '850.00', stock: 4, image: null };
    const cart = new CartService();
    cart.add(product);
    const productsApi = { getProducts: () => of([product]) } as any;
    const salesApi = { createSale: jasmine.createSpy('createSale').and.returnValue(of({ sale_id: 10, total: 850, message: 'ok' })) } as any;
    const component = new PosComponent(cart, productsApi, salesApi);

    component.submitSale();

    expect(salesApi.createSale).toHaveBeenCalledOnceWith({ items: [{ product_id: 3, quantity: 1 }] });
    expect(Object.keys(salesApi.createSale.calls.mostRecent().args[0])).toEqual(['items']);
    expect(cart.items.length).toBe(0);
  });
});
