import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { CartService } from '../../services/cart';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  const validData = { email: 'ana@example.com', password: 'ejemplo' };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [LoginPage], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function submit(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  function enter(name: string, value: string): HTMLInputElement {
    const input = fixture.nativeElement.querySelector('[formControlName="' + name + '"]') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return input;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts invalid, pristine and untouched without premature errors', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
    expect(fixture.nativeElement.querySelector('.auth-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('.auth-notice').textContent).toContain('Conexión con el servidor pendiente');
    for (const control of Object.values(component.form.controls)) {
      expect(control.hasError('required')).toBe(true);
    }
  });

  it('marks every control touched, shows errors and focuses the first invalid field on submission', async () => {
    submit();
    await fixture.whenStable();
    for (const control of Object.values(component.form.controls)) expect(control.touched).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.auth-error').length).toBe(2);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Revisa los campos');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('#' + input.getAttribute('aria-describedby'))).toBeTruthy();
  });

  it('tracks dirty and touched separately and clears corrected email errors', async () => {
    const control = component.form.controls.email;
    const input = enter('email', 'incorrecto');
    await fixture.whenStable();
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(false);
    expect(control.hasError('email')).toBe(true);
    expect(fixture.nativeElement.querySelector('.auth-error').textContent).toContain('formato válido');
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(control.touched).toBe(true);
    enter('email', 'ana@example.com');
    await fixture.whenStable();
    expect(control.valid).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(fixture.nativeElement.querySelector('.auth-error')).toBeNull();
  });

  it('focuses the first remaining invalid field rather than always the email', async () => {
    component.form.setValue(validData);
    component.form.controls.password.setValue('');
    submit();
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('[formControlName="password"]'));
    expect(component.form.invalid).toBe(true);
  });

  it('reports local validation only, preserves the route and cart, and does not store or log credentials', async () => {
    const router = TestBed.inject(Router);
    const cart = TestBed.inject(CartService);
    cart.addProduct('pizza-pepperoni', 2);
    const before = cart.items();
    const url = router.url;
    const store = vi.spyOn(Storage.prototype, 'setItem');
    const log = vi.spyOn(console, 'log');
    const fetch = vi.spyOn(globalThis, 'fetch');
    try {
      component.form.setValue(validData);
      expect(component.form.valid).toBe(true);
      submit();
      await fixture.whenStable();
      const message = fixture.nativeElement.querySelector('[role="status"]').textContent;
      expect(message).toContain('superaron las validaciones locales');
      expect(message).toContain('No se ha iniciado sesión');
      expect(router.url).toBe(url);
      expect(cart.items()).toBe(before);
      expect(store).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('[formControlName="role"]')).toBeNull();
      enter('email', 'otro@example.com');
      await fixture.whenStable();
      expect(component.feedback()).toBe('');
    } finally {
      store.mockRestore();
      log.mockRestore();
      fetch.mockRestore();
    }
  });

  it('resets nonNullable controls to strings', () => {
    component.form.setValue(validData);
    component.form.reset();
    for (const control of Object.values(component.form.controls)) expect(control.value).toBe('');
  });

  it('navigates to the other form using its actual routerLink', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');
    (harness.routeNativeElement!.querySelector('.auth-switch a') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/registro');
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Crear una cuenta');
  });
});
