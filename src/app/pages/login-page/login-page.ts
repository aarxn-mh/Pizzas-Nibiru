import { Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login-page',
  styleUrl: './login-page.css',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly feedback = signal('');

  constructor() {
    // Un resultado anterior deja de aplicar cuando se editan los datos.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.feedback.set(''));
  }

  showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.feedback.set('Revisa los campos indicados. No se ha iniciado sesión.');
      const firstInvalid = Object.keys(this.form.controls).find(name => this.form.get(name)?.invalid);
      this.element.nativeElement.querySelector<HTMLInputElement>(`[formControlName="${firstInvalid}"]`)?.focus();
      return;
    }
    // Aquí se delegará en AuthService cuando exista el servidor.
    this.feedback.set('Los datos superaron las validaciones locales. No se ha iniciado sesión porque el servidor no está conectado.');
  }
}
