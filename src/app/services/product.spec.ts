import { TestBed } from '@angular/core/testing';
import { ProductService } from './product';

describe('ProductService', () => {
  it('provides local products with valid categories and unique ids', () => {
    const service = TestBed.inject(ProductService);
    expect(new Set(service.products.map(product => product.id)).size).toBe(service.products.length);
    for (const product of service.products) {
      expect(service.categories.some(category => category.id === product.categoryId)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
    }
  });
});
