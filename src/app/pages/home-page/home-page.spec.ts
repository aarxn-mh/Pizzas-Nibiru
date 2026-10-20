import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';
import { ProductService } from '../../services/product';

describe('HomePage', () => {
  it('renders the local featured products and active categories', async () => {
    TestBed.configureTestingModule({ imports: [HomePage], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-category-card').length).toBe(6);
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('No disponible');
  });

  it('provides empty states when no catalog data exists', async () => {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: ProductService, useValue: { categories: [], products: [] } }],
    });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Por ahora no hay productos destacados.');
    expect(fixture.nativeElement.textContent).toContain('Por ahora no hay categorías disponibles.');
  });
});
