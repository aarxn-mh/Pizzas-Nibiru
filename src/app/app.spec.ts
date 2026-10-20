import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] }));

  it('renders the shared layout with a skip target', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('header')).toBeTruthy();
    expect(element.querySelector('main#main-content')).toBeTruthy();
    expect(element.querySelector('footer')).toBeTruthy();
  });

  it('redirects the root to Home and keeps all existing routes reachable', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Un universo de sabor');
    for (const path of ['/menu', '/producto/pizza-pepperoni', '/carrito', '/login', '/registro', '/no-existe']) {
      await harness.navigateByUrl(path);
      expect(harness.routeNativeElement?.textContent?.trim()).toBeTruthy();
    }
  });
});
