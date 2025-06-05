import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormsModule 
} from '@angular/forms';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule ],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css'],
})
export class RegistracijaComponent {
  currentStep = 1;
  totalSteps = 3;
  steps = [1, 2, 3];

  showPassword = false;
  isLockedOut = false; // za dugme prikaza lozinke ako je potrebno
    izabranoZanimanjeId: number | null = null;  // ovde se čuva ID izabranog zanimanja
  tipLica: string = ''; // vrednosti: 'fizicko_lice' ili 'pravno_lice' ili nešto drugo
  today = new Date().toISOString().split('T')[0];
  zanimanja = [
  { id: 1, naziv: 'Inženjer' },
  { id: 2, naziv: 'Lekar' },
  { id: 3, naziv: 'Nastavnik' },
  { id: 4, naziv: 'Arhitekta' },
  { id: 5, naziv: 'Programer' },
  { id: 6, naziv: 'Vodoinstalater' },
  { id: 7, naziv: 'Poljoprivrednik' },
  { id: 8, naziv: 'Novinar' },
];

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
      zanimanje: ['', Validators.required],
      datumRodjenja: [{ value: '', disabled: true }, Validators.required],
    });
    // 👉 Logika za resetovanje i kontrolu zanimanja
  this.step3Form.get('tip')?.valueChanges.subscribe(value => {
    const zanimanjeControl = this.step3Form.get('zanimanje');
    const datumRodjenjaControl = this.step3Form.get('datumRodjenja');
    if (value === 'fizicko_lice') {
      zanimanjeControl?.enable();
      datumRodjenjaControl?.enable();
    } else {
      zanimanjeControl?.reset();
      zanimanjeControl?.disable();

      datumRodjenjaControl?.reset();
      datumRodjenjaControl?.disable();
    }
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
        console.log('ovo je tip zanimanja ',this.step3Form.value)
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
