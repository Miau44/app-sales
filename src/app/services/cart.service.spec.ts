import { CartService } from './cart.service';
import { Product } from '../models/sales.models';

const product = (overrides: Partial<Product> = {}): Product => ({ id: 7, name: 'Teclado', price: '25.50', stock: 3, image: null, ...overrides });

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => cart = new CartService());

  it('consolida productos repetidos y calcula el subtotal estimado', () => {
    const keyboard = product();
    expect(cart.add(keyboard)).toBeTrue();
    expect(cart.add(keyboard)).toBeTrue();
    expect(cart.items.length).toBe(1);
    expect(cart.count).toBe(2);
    expect(cart.total).toBe(51);
  });

  it('impide exceder el stock disponible', () => {
    const keyboard = product({ stock: 1 });
    expect(cart.add(keyboard)).toBeTrue();
    expect(cart.add(keyboard)).toBeFalse();
    cart.setQuantity(keyboard.id, 8);
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.hasStockIssues).toBeFalse();
  });

  it('marca conflictos cuando el stock baja mientras hay una venta abierta', () => {
    cart.add(product({ stock: 5 }));
    cart.setQuantity(7, 3);
    cart.refreshProducts([product({ stock: 2 })]);
    expect(cart.hasStockIssues).toBeTrue();
    cart.setQuantity(7, 2);
    expect(cart.hasStockIssues).toBeFalse();
  });
});
