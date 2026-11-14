import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { CartService } from '../../services/cart';

describe('Header', () => {
  it('reacts to additions, increments, decrements, removals and clearing', async () => {
    TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Header);
    const cart = TestBed.inject(CartService);
    const check = async (quantity: number) => {
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.basket-count').textContent).toBe(String(quantity));
      expect(fixture.nativeElement.querySelector('.basket').getAttribute('aria-label')).toBe(`Carrito, ${quantity} unidades`);
    };
    await check(0);
    cart.addProduct('pizza-pepperoni', 2);
    await check(2);
    cart.increaseQuantity('pizza-pepperoni');
    await check(3);
    cart.decreaseQuantity('pizza-pepperoni');
    await check(2);
    cart.addProduct('pasta-casa');
    cart.removeProduct('pizza-pepperoni');
    await check(1);
    cart.clear();
    await check(0);
  });
  it('renders links to existing routes', async () => {
    TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('a[href]').length).toBeGreaterThan(0);
  });

  it('toggles navigation and returns focus to its button on Escape', async () => {
    TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    const nav = fixture.nativeElement.querySelector('#main-navigation') as HTMLElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(nav.classList.contains('is-open')).toBe(true);
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});
