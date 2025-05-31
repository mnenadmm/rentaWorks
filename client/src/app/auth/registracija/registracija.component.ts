import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent {
  errorMessage = '';
  currentStep = 1;
  steps = [1, 2, 3, 4];
  showPassword = false;
  isLockedOut = false;

  step1Form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.step1Form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      ime: ['', Validators.required],
      prezime: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Postavljanje disabled na kontrolu PRAVILNO u FormGroup konstruktoru
      password: [{ value: '', disabled: this.isLockedOut }, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [{ value: '', disabled: this.isLockedOut }, Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nextStep() {
    if(this.currentStep === 1 && this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.errorMessage = '';
      if(this.step1Form.errors?.['passwordMismatch']) {
        this.errorMessage = 'Lozinka i potvrda lozinke se ne poklapaju.';
      }
      return;
    }
    if (this.currentStep < this.steps.length) {
      this.errorMessage = '';
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  submit() {
    if (this.step1Form.valid) {
      alert('Registracija poslata!');
      // TODO: poziv API-ja i ostala logika
    } else {
      this.step1Form.markAllAsTouched();
      this.currentStep = 1;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Primer ako treba naknadno da zaključaš/otključaš polja
  setLockout(lock: boolean) {
    this.isLockedOut = lock;
    if (lock) {
      this.step1Form.get('password')?.disable();
      this.step1Form.get('confirmPassword')?.disable();
    } else {
      this.step1Form.get('password')?.enable();
      this.step1Form.get('confirmPassword')?.enable();
    }
  }
}
