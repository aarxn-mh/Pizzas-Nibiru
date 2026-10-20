import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { ProductService } from '../../services/product';

describe('ProductCard', () => {
  it('renders supplied data and a catalog route', async () => {
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    const service = TestBed.inject(ProductService);
    fixture.componentRef.setInput('product', service.products[0]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')?.textContent).toBe(service.products[0].name);
    expect(element.querySelector('a')?.getAttribute('href')).toContain('/producto/');
  });

  it('renders the menu variant without featured branding and preserves availability', async () => {
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    const service = TestBed.inject(ProductService);
    fixture.componentRef.setInput('product', service.products[2]);
    fixture.componentRef.setInput('variant', 'menu');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.menu-card')).toBeTruthy();
    expect(element.querySelector('.badge')).toBeNull();
    expect(element.textContent).toContain('No disponible');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/producto/hamburguesa-clasica');
  });
});
