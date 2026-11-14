import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';
import { CartPage } from './cart-page';

describe('CartPage', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('starts empty and loads a clearly identified example using normal service actions', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/carrito', CartPage);
    const cart = TestBed.inject(CartService);
    expect(harness.routeNativeElement!.textContent).toContain('Tu carrito está vacío');
    expect(harness.routeNativeElement!.querySelector('a[routerLink="/menu"]')).toBeTruthy();
    expect(harness.routeNativeElement!.querySelector('.cart-summary')).toBeNull();
    const add = vi.spyOn(cart, 'addProduct');
    (harness.routeNativeElement!.querySelector('.example-button') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(add).toHaveBeenCalledTimes(2);
    expect(cart.totalQuantity()).toBe(3);
    expect(cart.subtotal()).toBe(447);
    expect(harness.routeNativeElement!.querySelectorAll('.cart-item').length).toBe(2);
    expect(harness.routeNativeElement!.textContent).toContain('demostración');
    expect(harness.routeNativeElement!.querySelector('.checkout-note')?.textContent).toContain('autenticación');
    expect(harness.routeNativeElement!.querySelector('a[href*="checkout"]')).toBeNull();
  });

  it('updates quantities and subtotal in the DOM, removes and clears', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/carrito', CartPage);
    page.loadExample();
    await harness.fixture.whenStable();
    const first = harness.routeNativeElement!.querySelector('.cart-item')!;
    const buttons = first.querySelectorAll<HTMLButtonElement>('.quantity-control button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].getAttribute('aria-label')).toContain('Pizza de pepperoni');
    buttons[1].click();
    await harness.fixture.whenStable();
    expect(first.querySelector('.quantity')?.textContent).toBe('2');
    expect(harness.routeNativeElement!.querySelector('.subtotal')?.textContent).toContain('636.00');
    buttons[0].click();
    await harness.fixture.whenStable();
    expect(first.querySelector('.quantity')?.textContent).toBe('1');
    (first.querySelector('.remove-button') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.querySelectorAll('.cart-item').length).toBe(1);
    (harness.routeNativeElement!.querySelector('.clear-button') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('Tu carrito está vacío');
    expect(TestBed.inject(CartService).subtotal()).toBe(0);
  });

  it('preserves root state across navigation and never reloads examples automatically', async () => {
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/carrito', CartPage);
    first.loadExample();
    const cart = TestBed.inject(CartService);
    await harness.navigateByUrl('/menu');
    const next = await harness.navigateByUrl('/carrito', CartPage);
    expect(next).not.toBe(first);
    expect(next.cart).toBe(cart);
    expect(cart.items().length).toBe(2);
    cart.clear();
    await harness.navigateByUrl('/home');
    await harness.navigateByUrl('/carrito', CartPage);
    expect(cart.items()).toEqual([]);
    expect(harness.routeNativeElement!.querySelector('.empty-state')).toBeTruthy();
  });

  it('shows incident messages, excludes amounts and disables increases', async () => {
    const catalog = new ProductService().products.map(product => ({ ...product }));
    TestBed.overrideProvider(ProductService, { useValue: {
      products: catalog,
      getProductById: (id: string) => catalog.find(product => product.id === id && product.active),
    } });
    const cart = TestBed.inject(CartService);
    cart.addProduct('pizza-pepperoni', 2);
    cart.addProduct('pasta-casa');
    catalog[0] = { ...catalog[0], available: false };
    catalog[1] = { ...catalog[1], active: false };
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/carrito', CartPage);
    const element = harness.routeNativeElement!;
    expect(element.querySelector('.subtotal')?.textContent).toContain('productos disponibles');
    expect(element.querySelector('.subtotal')?.textContent).toContain('0.00');
    expect(element.textContent).toContain('No disponible para la venta');
    expect(element.textContent).toContain('Producto fuera del catálogo');
    for (const button of element.querySelectorAll<HTMLButtonElement>('.quantity-control button:last-child')) {
      expect(button.disabled).toBe(true);
    }
    expect(element.querySelectorAll('.remove-button').length).toBe(2);
    expect(cart.totalQuantity()).toBe(3);
  });
});
