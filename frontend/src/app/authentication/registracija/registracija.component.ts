import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-registracija',
  standalone: false,
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']  // ispravno styleUrls
})
export class RegistracijaComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  steps = [1, 2, 3];
  showPassword = false;
  isLockedOut = false;

  tipLica: string = '';
  izabranoZanimanjeId: number | null = null;
  successMessage = '';


  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;

  zanimanja = [
    { id: 1, naziv: 'Gradjevincki radnik' },
    { id: 2, naziv: 'Vozac C' },
    { id: 3, naziv: 'Moler' },
    { id: 4, naziv: 'ELektricar' },
    { id: 5, naziv: 'Programer' },
    { id: 6, naziv: 'Vodoinstalater' },
    { id: 7, naziv: 'Dostavljac' },
    { id: 8, naziv: 'Fizicki radnik' },
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

  constructor(private fb: FormBuilder) {
    // Konstruktor samo dependency injection
  }

  ngOnInit() {
    this.initStep1Form();
    this.initStep2Form();
    this.initStep3Form();
    this.registerFormListeners();
  }

  private initStep1Form() {
    this.step1Form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(4)]],
        ime: ['', Validators.required],
        prezime: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  getPasswordError(): string | null {
    const control = this.step1Form.get('password');
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return 'Lozinka je obavezna.';
      }
      if (control.errors['minlength']) {
        return 'Lozinka mora imati najmanje 8 karaktera.';
      }
      if (control.errors['pattern']) {
        return 'Lozinka mora sadržati najmanje jedno veliko slovo, malo slovo, broj i specijalni karakter.';
      }
    }
    return null;
  }

  private initStep2Form() {
    this.step2Form = this.fb.group({
      drzavljanstvo: ['', Validators.required],
      adresa: ['', Validators.required],
      adresaBroj: ['', [Validators.required, Validators.min(1)]],
      grad: ['', Validators.required],
      telefon: ['', Validators.required],
    });
  }

  private initStep3Form() {
    this.step3Form = this.fb.group({
      tip: ['', Validators.required],
      zanimanje: [{ value: '', disabled: true }, Validators.required],
      datumRodjenja: [{ value: '', disabled: true }, Validators.required],
    });
  }

  get isDatumRodjenjaDisabled(): boolean {
    return this.step3Form.get('datumRodjenja')?.disabled ?? false;
  }

  private registerFormListeners() {
    this.step3Form.get('tip')?.valueChanges.subscribe((value) => {
      const jeFizicko = value === 'fizicko_lice';
      this.toggleFormControl('zanimanje', jeFizicko);
      this.toggleFormControl('datumRodjenja', jeFizicko);
    });
  }

  private toggleFormControl(controlName: string, enable: boolean) {
    const control = this.step3Form.get(controlName);
    if (!control) return;
    if (enable) {
      control.enable();
    } else {
      control.reset();
      control.disable();
    }
    control.updateValueAndValidity();
  }

  private passwordsMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
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

  handleSubmit() {
    const form = this.getCurrentForm();
    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    if (this.currentStep === this.totalSteps) {
      const payload = {
        ...this.step1Form.value,
        ...this.step2Form.value,
        ...this.step3Form.value,
      };
      console.log('poslali smo formu ',payload)
      
    const email = this.step1Form.get('email')?.value || '[nepoznat email]';
    this.successMessage = `Na email: ${email} je poslat link za verifikaciju. Proverite svoj inbox.`;
      // TODO: Slanje na backend
    } else {
      this.nextStep();
    }
  }

  selectedDate?: Date;

  onDateSelected(date: Date) {
    this.step3Form.get('datumRodjenja')!.setValue(date);
    this.step3Form.get('datumRodjenja')!.markAsTouched();
    this.step3Form.get('datumRodjenja')!.updateValueAndValidity();
  }
}
