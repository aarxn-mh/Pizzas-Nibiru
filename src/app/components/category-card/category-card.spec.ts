import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CategoryCard } from './category-card';
import { ProductService } from '../../services/product';

describe('CategoryCard', () => {
  it('renders supplied data and a catalog route', async () => {
    TestBed.configureTestingModule({ imports: [CategoryCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(CategoryCard);
    const service = TestBed.inject(ProductService);
    fixture.componentRef.setInput('category', service.categories[0]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')?.textContent).toBe(service.categories[0].name);
    expect(element.querySelector('a')?.getAttribute('href')).toContain('/menu?categoria=');
  });
});
