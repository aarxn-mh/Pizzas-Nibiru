import { TestBed } from '@angular/core/testing';
import { ProductService } from './product';

describe('ProductService', () => {
  it('finds a public product without changing the catalog', () => {
    const service = TestBed.inject(ProductService);
    expect(service.getProductById('pizza-pepperoni')).toBe(service.products[0]);
    expect(service.getProductById('no-existe')).toBeUndefined();
    expect(service.getProductById('')).toBeUndefined();
  });

  it('hides inactive products but retains active unavailable products', () => {
    const service = TestBed.inject(ProductService);
    expect(service.getProductById('hamburguesa-clasica')?.available).toBe(false);
    const fixture = Object.assign(new ProductService(), {
      products: service.products.map(product => ({ ...product, active: false })),
    });
    expect(fixture.getProductById('pizza-pepperoni')).toBeUndefined();
  });

  it('provides local products with valid categories and unique ids', () => {
    const service = TestBed.inject(ProductService);
    expect(new Set(service.products.map(product => product.id)).size).toBe(service.products.length);
    for (const product of service.products) {
      expect(service.categories.some(category => category.id === product.categoryId)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
    }
  });
});
