import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent {
  errorMessage = '';
  currentStep = 1;
  steps = [1, 2, 3, 4];
  showPassword = false;
  isLockedOut = false;

  form: FormGroup;

  drzave = [
    { code: 'RS', name: 'Srbija' },
    { code: 'HR', name: 'Hrvatska' },
    { code: 'BA', name: 'Bosna i Hercegovina' },
    { code: 'DE', name: 'Nemačka' },
    { code: 'US', name: 'Sjedinjene Američke Države' }
  ];
  zanimanja= [
    { idZanimanja: 1, name: 'Elektricar' },
    { idZanimanja: 2, name: 'Vozac' },
    { idZanimanja: 3, name: 'Poslasticar' },
    { idZanimanja: 4, name: 'Konobar' },
    { idZanimanja: 5, name: 'Pizza majstor' },
    { idZanimanja: 6, name: 'Kuvar' }
  ];
  tip_korisnika =[
    { id_tip_korisnika: 1 , name: 'Fizicko lice'},
    { id_tip_korisnika: 2 , name: 'Pravno lice'},
  ]
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      step1: this.fb.group({
        username: ['', [Validators.required, Validators.minLength(4)]],
        ime: ['', Validators.required],
        prezime: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [{ value: '', disabled: this.isLockedOut }, [Validators.required, Validators.minLength(8)]],
        confirmPassword: [{ value: '', disabled: this.isLockedOut }, Validators.required]
      }, { validators: this.passwordMatchValidator }),

      step2: this.fb.group({
        drzavljanstvo: ['', Validators.required],
        adresa: ['', Validators.required],
        grad: ['', Validators.required],
        telefon: ['', [Validators.required, Validators.pattern(/^\+?\d+$/)]],
        adresaBroj: ['', Validators.required]
      }),

      step3: this.fb.group({
        tip_korisnika: ['', Validators.required], 
        zanimanje: ['', Validators.required], 
      }),
      step4: this.fb.group({})
    });
  }

  // Getter za formu prvog koraka
  get step1Form() {
    return this.form.get('step1') as FormGroup;
  }

  // Getter za formu drugog koraka
  get step2Form() {
    return this.form.get('step2') as FormGroup;
  }
  // Getter za formu drugog koraka
  get step3Form() {
    return this.form.get('step3') as FormGroup;
  }
  // Custom validator: proverava da li se lozinka i potvrda poklapaju
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Prelazi na sledeći korak ako je forma validna
  nextStep() {
    if (this.currentStep === 1 && this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.errorMessage = this.step1Form.errors?.['passwordMismatch'] ? 'Lozinke se ne poklapaju.' : '';
      return;
    }
    if (this.currentStep === 2 && this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      this.errorMessage = 'Molimo popunite tražena polja.';
      return;
    }

    if (this.currentStep < this.steps.length) {
      this.errorMessage = '';
      this.currentStep++;
    }
  }

  // Vraća na prethodni korak
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  // Završava registraciju ako je cela forma validna
  submit() {
    if (this.form.valid) {
      alert('Registracija uspešna!');
      console.log(this.form.value);
    } else {
      this.form.markAllAsTouched();
      this.errorMessage = 'Molimo popunite sve obavezne podatke.';
      this.currentStep = 1;
    }
  }

  // Menja vidljivost lozinke
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Zaključava ili otključava unos lozinke
  setLockout(lock: boolean) {
    this.isLockedOut = lock;
    const pw = this.step1Form.get('password');
    const cpw = this.step1Form.get('confirmPassword');
    lock ? (pw?.disable(), cpw?.disable()) : (pw?.enable(), cpw?.enable());
  }

  // NOVO: Vraća trenutno aktivnu formu u zavisnosti od koraka
  getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.form.get('step3') as FormGroup;
      case 4: return this.form.get('step4') as FormGroup;
      default: return this.step1Form;
    }
  }

  // NOVO: Obrađuje slanje forme, automatski poziva sledeći korak ili submit
  handleSubmit(): void {
    const currentForm = this.getCurrentForm();
    if (currentForm.invalid) {
      currentForm.markAllAsTouched();
      this.errorMessage = 'Molimo popunite tražena polja.';
      return;
    }

    if (this.currentStep === 4) {
      this.submit();
    } else {
      this.nextStep();
    }
  }
}
