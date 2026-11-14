import { Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Error del grupo: compara dos controles sin sobrescribir sus errores propios.
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;
  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-page',
  styleUrl: './register-page.css',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordsMatch });
  readonly feedback = signal('');

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.feedback.set(''));
  }

  showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  showPasswordMismatch(): boolean {
    const confirmation = this.form.controls.confirmPassword;
    return this.form.hasError('passwordMismatch') && (confirmation.touched || confirmation.dirty);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.feedback.set('Revisa los campos indicados. No se ha creado ninguna cuenta.');
      const firstInvalid = Object.keys(this.form.controls).find(name => this.form.get(name)?.invalid)
        ?? 'confirmPassword';
      this.element.nativeElement.querySelector<HTMLInputElement>(`[formControlName="${firstInvalid}"]`)?.focus();
      return;
    }
    this.feedback.set('Los datos superaron las validaciones locales. No se ha creado ninguna cuenta porque el servidor no está conectado.');
  }
}
