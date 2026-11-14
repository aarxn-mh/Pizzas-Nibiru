import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { ProductService } from './product';
import { Product } from '../interfaces/product.interface';

describe('CartService', () => {
  let catalog: Product[];
  let cart: CartService;

  beforeEach(() => {
    catalog = new ProductService().products.map(product => ({ ...product }));
    TestBed.configureTestingModule({ providers: [{
      provide: ProductService,
      useValue: { getProductById: (id: string) => catalog.find(product => product.id === id && product.active) },
    }] });
    cart = TestBed.inject(CartService);
  });

  it('starts empty and exposes shared read-only signals', () => {
    expect(cart.items()).toEqual([]);
    expect(cart.lines()).toEqual([]);
    expect(cart.totalQuantity()).toBe(0);
    expect(cart.subtotal()).toBe(0);
    expect(TestBed.inject(CartService)).toBe(cart);
    expect('set' in cart.items).toBe(false);
  });

  it('adds products, merges repeated ids and derives prices from the catalog', () => {
    expect(cart.addProduct('pizza-pepperoni', 2)).toBe(true);
    cart.addProduct('pizza-pepperoni');
    cart.addProduct('pasta-casa', 2);
    expect(cart.items()).toEqual([
      { productId: 'pizza-pepperoni', quantity: 3 },
      { productId: 'pasta-casa', quantity: 2 },
    ]);
    expect(cart.totalQuantity()).toBe(5);
    expect(cart.subtotalCents()).toBe(82500);
    expect(cart.subtotal()).toBe(825);
    expect(cart.lines()[0].product).toBe(catalog[0]);
  });

  it('increments and decrements immutably without going below one', () => {
    cart.addProduct('pizza-pepperoni');
    const before = cart.items();
    expect(cart.increaseQuantity('pizza-pepperoni')).toBe(true);
    expect(before[0].quantity).toBe(1);
    expect(cart.items()).not.toBe(before);
    expect(cart.items()[0].quantity).toBe(2);
    expect(cart.decreaseQuantity('pizza-pepperoni')).toBe(true);
    expect(cart.decreaseQuantity('pizza-pepperoni')).toBe(false);
    expect(cart.items()[0].quantity).toBe(1);
    expect(cart.increaseQuantity('missing')).toBe(false);
    expect(cart.decreaseQuantity('missing')).toBe(false);
  });

  it('rejects invalid quantities and unsafe arithmetic', () => {
    for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER]) {
      expect(cart.addProduct('pizza-pepperoni', value)).toBe(false);
    }
    expect(cart.items()).toEqual([]);
    cart.addProduct('pizza-pepperoni');
    expect(cart.addProduct('pizza-pepperoni', -2)).toBe(false);
    expect(cart.items()[0].quantity).toBe(1);
  });

  it('removes individual products and stays empty after clearing', () => {
    cart.addProduct('pizza-pepperoni', 2);
    cart.addProduct('pasta-casa');
    cart.removeProduct('pizza-pepperoni');
    expect(cart.items()).toEqual([{ productId: 'pasta-casa', quantity: 1 }]);
    expect(cart.subtotal()).toBe(129);
    cart.clear();
    cart.refreshProducts();
    expect(cart.items()).toEqual([]);
    expect(cart.subtotal()).toBe(0);
    expect(cart.totalQuantity()).toBe(0);
  });

  it('rejects unknown, inactive and unavailable products when adding', () => {
    catalog[0] = { ...catalog[0], active: false };
    expect(cart.addProduct('missing')).toBe(false);
    expect(cart.addProduct('pizza-pepperoni')).toBe(false);
    expect(cart.addProduct('hamburguesa-clasica')).toBe(false);
    expect(cart.items()).toEqual([]);
  });

  it('retains unavailable lines, excludes their amounts and prevents increases', () => {
    cart.addProduct('pizza-pepperoni', 2);
    cart.addProduct('pasta-casa');
    catalog[0] = { ...catalog[0], available: false };
    expect(cart.increaseQuantity('pizza-pepperoni')).toBe(false);
    expect(cart.items()[0].quantity).toBe(2);
    expect(cart.lines()[0].issue).toBe('unavailable');
    expect(cart.lines()[0].lineSubtotalCents).toBeNull();
    expect(cart.subtotal()).toBe(129);
    expect(cart.totalQuantity()).toBe(3);
    expect(cart.issueCount()).toBe(1);
    expect(cart.decreaseQuantity('pizza-pepperoni')).toBe(true);
    cart.removeProduct('pizza-pepperoni');
    expect(cart.issueCount()).toBe(0);
  });

  it('retains removed and inactive references until explicitly deleted', () => {
    cart.addProduct('pizza-pepperoni');
    cart.addProduct('pasta-casa');
    catalog[0] = { ...catalog[0], active: false };
    catalog.splice(1, 1);
    cart.refreshProducts();
    expect(cart.lines().every(line => line.issue === 'missing')).toBe(true);
    expect(cart.items().length).toBe(2);
    expect(cart.subtotal()).toBe(0);
    cart.removeProduct('pizza-pepperoni');
    expect(cart.items().length).toBe(1);
  });

  it('calculates currency in cents and refreshes current local prices', () => {
    catalog[0] = { ...catalog[0], price: 0.1 };
    catalog[1] = { ...catalog[1], price: 0.2 };
    cart.addProduct('pizza-pepperoni', 3);
    cart.addProduct('pasta-casa');
    expect(cart.subtotalCents()).toBe(50);
    expect(cart.subtotal()).toBe(0.5);
    catalog[0] = { ...catalog[0], price: 0.15 };
    cart.refreshProducts();
    expect(cart.subtotalCents()).toBe(65);
  });
});
