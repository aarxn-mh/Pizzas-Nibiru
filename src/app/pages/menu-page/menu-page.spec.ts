import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MenuPage } from './menu-page';
import { routes } from '../../app.routes';
import { ProductService } from '../../services/product';

describe('MenuPage', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('renders the local active catalog and keeps detail links', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu', MenuPage);
    expect(page.filteredProducts().length).toBe(3);
    const cards = harness.routeNativeElement!.querySelectorAll('app-product-card');
    expect(cards.length).toBe(3);
    expect(cards[0].querySelector('a')?.getAttribute('href')).toBe('/producto/pizza-pepperoni');
    expect(harness.routeNativeElement!.textContent).toContain('No disponible');
    expect(harness.routeNativeElement!.querySelector('.badge')).toBeNull();
  });

  it('reads category parameters and responds when the URL changes', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu?categoria=pizza', MenuPage);
    expect(page.selectedCategory()).toBe('pizza');
    expect(page.filteredProducts().map(product => product.id)).toEqual(['pizza-pepperoni']);
    const samePage = await harness.navigateByUrl('/menu?categoria=salads', MenuPage);
    expect(samePage).toBe(page);
    expect(page.filteredProducts()).toEqual([]);
    expect(harness.routeNativeElement!.querySelector('.empty-state')).toBeTruthy();
    await harness.navigateByUrl('/menu?categoria=does-not-exist', MenuPage);
    expect(page.selectedCategory()).toBeNull();
    expect(page.filteredProducts().length).toBe(3);
  });

  it('combines typed search and category selection, then clears both', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu?categoria=pizza', MenuPage);
    const input = harness.routeNativeElement!.querySelector('input') as HTMLInputElement;
    input.value = 'pasta';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await harness.fixture.whenStable();
    expect(page.searchText()).toBe('pasta');
    expect(page.filteredProducts()).toEqual([]);
    expect(harness.routeNativeElement!.textContent).toContain('No encontramos productos');
    (harness.routeNativeElement!.querySelector('.filter-summary button') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(page.selectedCategory()).toBeNull();
    expect(page.searchText()).toBe('');
    expect(input.value).toBe('');
    expect(TestBed.inject(Router).url).toBe('/menu');
    expect(page.filteredProducts().length).toBe(3);
  });

  it('matches names ignoring case, accents and surrounding whitespace', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu', MenuPage);
    page.searchText.set('  CLASICA  ');
    expect(page.filteredProducts().map(product => product.id)).toEqual(['hamburguesa-clasica']);
    page.searchText.set('queso');
    expect(page.filteredProducts()).toEqual([]); // Busca nombres, no descripciones.
  });

  it('selects a category through the UI and preserves unrelated query parameters', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu?origen=home', MenuPage);
    const buttons = [...harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.category-bar button')];
    buttons.find(button => button.textContent?.trim() === 'Pizzas')!.click();
    await harness.fixture.whenStable();
    expect(page.selectedCategory()).toBe('pizza');
    expect(TestBed.inject(Router).url).toContain('categoria=pizza');
    expect(TestBed.inject(Router).url).toContain('origen=home');
    expect(buttons.find(button => button.textContent?.trim() === 'Pizzas')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports navigation from Home category cards to the filtered menu', async () => {
    const harness = await RouterTestingHarness.create('/home');
    (harness.routeNativeElement!.querySelector('app-category-card a[href*="categoria=pizza"]') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/menu?categoria=pizza');
    expect(harness.routeNativeElement!.querySelectorAll('app-product-card').length).toBe(1);
  });

  it('excludes inactive products and categories', async () => {
    const service = new ProductService();
    TestBed.overrideProvider(ProductService, { useValue: {
      categories: service.categories.map(category => ({ ...category, active: category.id !== 'pizza' })),
      products: service.products.map(product => ({ ...product, active: product.id !== 'pasta-casa' })),
    } });
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/menu', MenuPage);
    expect(page.filteredProducts().map(product => product.id)).toEqual(['hamburguesa-clasica']);
  });
});
