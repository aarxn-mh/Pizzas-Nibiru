import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { routes } from '../../app.routes';
import { CartService } from '../../services/cart';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  const validData = { firstName: 'Ana', lastName: 'Pérez', email: 'ana@example.com', phone: '+52 444 123 4567', password: 'ejemplo', confirmPassword: 'ejemplo' };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [RegisterPage], providers: [provideRouter(routes)] });
    fixture = TestBed.createComponent(RegisterPage);
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
    expect(fixture.nativeElement.querySelectorAll('.auth-error').length).toBe(6);
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
      expect(message).toContain('No se ha creado ninguna cuenta');
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

  it('validates mismatches at group level and focuses the confirmation', async () => {
    component.form.setValue({ ...validData, confirmPassword: 'diferente' });
    expect(component.form.hasError('passwordMismatch')).toBe(true);
    expect(component.form.controls.confirmPassword.valid).toBe(true);
    submit();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('[formControlName="confirmPassword"]') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.auth-error').textContent).toBe('Las contraseñas no coinciden.');
    enter('confirmPassword', validData.password);
    await fixture.whenStable();
    expect(component.form.valid).toBe(true);
    expect(component.form.hasError('passwordMismatch')).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(fixture.nativeElement.querySelector('.auth-error')).toBeNull();
    enter('password', 'cambiada');
    await fixture.whenStable();
    expect(component.form.hasError('passwordMismatch')).toBe(true);
  });

  it('keeps required errors distinct and imposes no undefined password or phone policies', () => {
    component.form.setValue({ ...validData, confirmPassword: '' });
    expect(component.form.controls.confirmPassword.hasError('required')).toBe(true);
    expect(component.form.hasError('passwordMismatch')).toBe(false);
    component.form.setValue({ ...validData, firstName: '李', lastName: "O’Connor", phone: '123', password: 'x', confirmPassword: 'x' });
    expect(component.form.valid).toBe(true);
  });

  it('navigates to the other form using its actual routerLink', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/registro');
    (harness.routeNativeElement!.querySelector('.auth-switch a') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Iniciar sesión');
  });
});
