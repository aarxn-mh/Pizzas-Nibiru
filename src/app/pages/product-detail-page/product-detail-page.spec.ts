import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { ProductService } from '../../services/product';
import { ProductDetailPage } from './product-detail-page';
import { CartService } from '../../services/cart';
import { Header } from '../../components/header/header';

describe('ProductDetailPage', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('renders a valid product with category, price, image and menu link', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    const element = harness.routeNativeElement!;
    expect(page.product()?.id).toBe('pizza-pepperoni');
    expect(element.querySelector('h1')?.textContent).toBe('Pizza de pepperoni');
    expect(element.querySelector('.category')?.textContent).toContain('Pizzas');
    expect(element.querySelector('.price')?.textContent).toContain('189.00');
    expect(element.querySelector('.price')?.textContent).toContain('MXN');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Pizza de pepperoni');
    expect(element.querySelector('.back-link')?.getAttribute('href')).toBe('/menu');
    expect(element.querySelector('.demo-note')).toBeTruthy();
    expect(element.querySelector('.add-button')?.textContent).toBe('Agregar al carrito (demo)');
    expect(page.quantity()).toBe(1);
    expect(page.subtotalCents()).toBe(18900);
  });

  it('shows an alternative state for an unknown id', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/producto/no-existe', ProductDetailPage);
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Producto no encontrado');
    expect(harness.routeNativeElement!.querySelector('.detail-card')).toBeNull();
    expect(harness.routeNativeElement!.querySelector('.empty-state a')?.getAttribute('href')).toBe('/menu');
  });

  it('does not expose an inactive product', async () => {
    const catalog = new ProductService();
    const inactive = Object.assign(new ProductService(), {
      products: catalog.products.map(product => ({ ...product, active: false })),
    });
    TestBed.overrideProvider(ProductService, { useValue: inactive });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    expect(harness.routeNativeElement!.querySelector('.empty-state')).toBeTruthy();
  });

  it('keeps active unavailable products visible with a clear explanation', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/producto/hamburguesa-clasica', ProductDetailPage);
    const element = harness.routeNativeElement!;
    expect(element.querySelector('h1')?.textContent).toBe('Hamburguesa clásica');
    expect(element.querySelector('.availability.unavailable')?.textContent).toContain('No disponible');
    expect(element.querySelector('.availability-note')).toBeTruthy();
    expect(element.querySelector('.price')).toBeTruthy();
    expect((element.querySelector('.add-button') as HTMLButtonElement).disabled).toBe(true);
    const page = harness.routeDebugElement!.componentInstance as ProductDetailPage;
    page.addToCart();
    expect(TestBed.inject(CartService).items()).toEqual([]);
  });

  it('updates data and alternative states when Angular reuses the component', async () => {
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    first.increaseQuantity();
    first.addToCart();
    const second = await harness.navigateByUrl('/producto/pasta-casa', ProductDetailPage);
    expect(second).toBe(first);
    expect(second.quantity()).toBe(1);
    expect(second.feedback()).toBe('');
    expect(second.subtotalCents()).toBe(12900);
    expect(second.productId()).toBe('pasta-casa');
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Pasta de la casa');
    expect(harness.routeNativeElement!.querySelector('.category')?.textContent).toContain('Pastas');
    await harness.navigateByUrl('/producto/no-existe', ProductDetailPage);
    expect(first.product()).toBeUndefined();
    expect(harness.routeNativeElement!.querySelector('.empty-state')).toBeTruthy();
    await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    expect(harness.routeNativeElement!.querySelector('.detail-card')).toBeTruthy();
  });

  it('increments, decrements and never selects less than one unit', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    page.decreaseQuantity();
    expect(page.quantity()).toBe(1);
    page.increaseQuantity();
    expect(page.quantity()).toBe(2);
    expect(page.subtotalCents()).toBe(37800);
    page.decreaseQuantity();
    page.decreaseQuantity();
    expect(page.quantity()).toBe(1);
    await harness.fixture.whenStable();
    expect((harness.routeNativeElement!.querySelector('[aria-label="Disminuir cantidad"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('adds through the visible button, merges lines and updates Header across navigation', async () => {
    const header = TestBed.createComponent(Header);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/menu');
    (harness.routeNativeElement!.querySelector('a[href="/producto/pizza-pepperoni"]') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    (harness.routeNativeElement!.querySelector('[aria-label="Aumentar cantidad"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    const add = harness.routeNativeElement!.querySelector('.add-button') as HTMLButtonElement;
    add.click();
    add.click();
    await harness.fixture.whenStable();
    await header.whenStable();
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toEqual([{ productId: 'pizza-pepperoni', quantity: 4 }]);
    expect(header.nativeElement.querySelector('.basket-count').textContent).toBe('4');
    expect(harness.routeNativeElement!.querySelector('[role="status"]')?.textContent).toContain('Producto agregado');
    (harness.routeNativeElement!.querySelector('.cart-link') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/carrito');
    expect(cart.totalQuantity()).toBe(4);
    await harness.navigateByUrl('/menu');
    expect(cart.totalQuantity()).toBe(4);
  });

  it('rejects invalid quantities and missing products without changing the cart', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
      page.quantity.set(quantity);
      expect(page.canAdd()).toBe(false);
      expect(page.subtotalCents()).toBeNull();
      page.addToCart();
      expect(TestBed.inject(CartService).items()).toEqual([]);
    }
    await harness.navigateByUrl('/producto/no-existe', ProductDetailPage);
    page.addToCart();
    expect(TestBed.inject(CartService).items()).toEqual([]);
  });

  it('reports service rejection without announcing success', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/producto/pizza-pepperoni', ProductDetailPage);
    const cart = TestBed.inject(CartService);
    // La selección cabe, pero sumarla a la línea existente desbordaría los centavos seguros.
    const maximum = Math.floor(Number.MAX_SAFE_INTEGER / 18900);
    expect(cart.addProduct('pizza-pepperoni', maximum)).toBe(true);
    page.addToCart();
    expect(page.feedback()).toContain('No se pudo agregar');
    expect(cart.totalQuantity()).toBe(maximum);
  });

  for (const source of ['/menu', '/home']) {
    it('navigates from ' + source + ' to each product detail', async () => {
      const harness = await RouterTestingHarness.create();
      for (const product of new ProductService().products) {
        await harness.navigateByUrl(source);
        (harness.routeNativeElement!.querySelector('a[href="/producto/' + product.id + '"]') as HTMLAnchorElement).click();
        await harness.fixture.whenStable();
        expect(TestBed.inject(Router).url).toBe('/producto/' + product.id);
        expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe(product.name);
      }
    });
  }
});
