import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css'],
})
export class RegistracijaComponent {
  currentStep = 1;
  totalSteps = 3;
  steps = [1, 2, 3];

  showPassword = false;
  isLockedOut = false; // za dugme prikaza lozinke ako je potrebno

  drzave = [
    { code: 'RS', name: 'Srbija' },
    { code: 'HR', name: 'Hrvatska' },
    { code: 'BA', name: 'Bosna i Hercegovina' },
    { code: 'MK', name: 'Severna Makedonija' },
    { code: 'SI', name: 'Slovenija' },
    { code: 'ME', name: 'Crna Gora' },
    { code: 'AL', name: 'Albanija' },
  ];

  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.step1Form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(4)]],
        ime: ['', Validators.required],
        prezime: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );

    this.step2Form = this.fb.group({
      drzavljanstvo: ['', Validators.required],
      adresa: ['', Validators.required],
      adresaBroj: ['', [Validators.required, Validators.min(1)]],
      grad: ['', Validators.required],
      telefon: ['', Validators.required],
    });

    this.step3Form = this.fb.group({
      tip: ['', Validators.required],
    });
  }

  getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1:
        return this.step1Form;
      case 2:
        return this.step2Form;
      case 3:
        return this.step3Form;
      default:
        return this.step1Form;
    }
  }

  passwordsMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  handleSubmit() {
    const form = this.getCurrentForm();

    if (form.valid) {
      if (this.currentStep === this.totalSteps) {
        // Logika za slanje podataka na backend ili dalju obradu
        console.log('Registracija uspešna', {
          ...this.step1Form.value,
          ...this.step2Form.value,
          ...this.step3Form.value,
        });
        alert('Registracija uspešna!');
        // Reset forme ili redirekcija...
      } else {
        this.nextStep();
      }
    } else {
      form.markAllAsTouched();
    }
  }
}
