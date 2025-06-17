import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import { ReferenceService } from '../../../services/reference.service';
import { Zanimanje,Vestina,Drzava } from '../../interfaces/reference.interface';
@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  standalone: false,
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {
  zanimanja: Zanimanje[] = [];
  vestine: Vestina[] = [];
  drzave: Drzava[] = [];
  // --- UI state ---
  vestineDropdownOpen = false;
  zanimanjeDropdownOpen = false;
  showVestineSection = false;
  showPassword = false;
  isLockedOut = false;
  formSubmitted = false;

  currentStep = 1;
  totalSteps = 3;
  steps = [1, 2, 3];

  successMessage = '';

  // --- Forme ---
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;

  // --- Podaci za selekt liste ---
  tipLica: string = '';
  izabranoZanimanjeId: number | null = null;



  constructor(private fb: FormBuilder, 
              private router: Router, 
              private authService : AuthenticationService,
              private referenceService: ReferenceService) {
    // Konstruktor koristi se samo za dependency injection
  }

  /** Angular lifecycle hook */
  ngOnInit() {
    this.initStep1Form();
    this.initStep2Form();
    this.initStep3Form();
    this.registerFormListeners();
    //Dodeljivanja vrednosti iz sevisa
    this.referenceService.getZanimanja().subscribe(data=>{this.zanimanja=data});
    this.referenceService.getDrzave().subscribe(data=>{this.drzave=data});
    this.referenceService.getVestine().subscribe(data=>{this.vestine=data});
  }

  // =====================
  // --- Form Inicijalizacija ---
  // =====================

  /** Inicijalizuje formu za prvi korak registracije */
  private initStep1Form() {
    this.step1Form = this.fb.group({
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
    }, { validators: this.passwordsMatchValidator });
  }

  /** Inicijalizuje formu za drugi korak registracije */
  private initStep2Form() {
    this.step2Form = this.fb.group({
      drzavljanstvo: ['', Validators.required],
      adresa: ['', Validators.required],
      adresaBroj: ['', [Validators.required, Validators.min(1)]],
      grad: ['', Validators.required],
      telefon: ['', Validators.required],
    });
  }

  /** Inicijalizuje formu za treći korak registracije */
  private initStep3Form() {
    this.step3Form = this.fb.group({
      tip_korisnika: ['', Validators.required],
      zanimanje: [{ value: '', disabled: true }, Validators.required],
      datumRodjenja: [{ value: '', disabled: true }, Validators.required],
      vestine: this.fb.array([]), // Prazan niz veština
    });
  }

  // ====================
  // --- Form Validacija ---
  // ====================

  /** Validacija da li su lozinke iste */
  private passwordsMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  /** Dohvata i vraća poruku o grešci za polje lozinke */
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

  // ===========================
  // --- Form Kontrole i Promene ---
  // ===========================

  /** Registruje osluškivače promena za dinamičku logiku na formi */
  private registerFormListeners() {
    this.step3Form.get('tip')?.valueChanges.subscribe(value => {
      const jeFizicko = value === 'fizicko_lice';

      // Omogući ili onemogući polja zanimanje i datumRodjenja
      this.toggleFormControl('zanimanje', jeFizicko);
      this.toggleFormControl('datumRodjenja', jeFizicko);

      // Validacija polja zanimanje na osnovu tipa lica
      const zanimanjeControl = this.step3Form.get('zanimanje');
      if (jeFizicko) {
        zanimanjeControl?.setValidators([Validators.required]);
      } else {
        zanimanjeControl?.clearValidators();
        zanimanjeControl?.reset(); // Resetuj ako nije fizičko lice
      }
      zanimanjeControl?.updateValueAndValidity();
    });
  }

  /** Omogućava ili onemogućava kontrolu na formi */
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

  // =======================
  // --- UI Pomoćne metode ---
  // =======================

  /** Dobavlja naziv izabranog zanimanja */
  getSelectedZanimanjeNaziv(): string | null {
    const id = this.step3Form.get('zanimanje')?.value;
    if (!id) return null;
    const zanimanje = this.zanimanja.find(z => z.id === id);
    return zanimanje ? zanimanje.naziv : null;
  }

  /** Dobavlja nazive izabranih veština */
  getSelectedVestineNames(): string[] {
    const selectedIds: number[] = this.step3Form.get('vestine')?.value || [];
    return this.vestine
      .filter(v => selectedIds.includes(v.id))
      .map(v => v.naziv);
  }

  /** Toggle vidljivosti lozinke */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /** Toggle otvaranje/zatvaranje dropdown-a za zanimanja */
  toggleZanimanjeDropdown() {
    this.zanimanjeDropdownOpen = !this.zanimanjeDropdownOpen;
  }

  /** Toggle otvaranje/zatvaranje sekcije za veštine */
  toggleVestineSection() {
    this.showVestineSection = !this.showVestineSection;
  }

  openVestineSection() {
    this.showVestineSection = true;
  }

  closeVestineSection() {
    this.showVestineSection = false;
  }

  closeZanimanjeDropdown() {
    this.zanimanjeDropdownOpen = false;
  }

  // =================
  // --- Navigacija između koraka ---
  // =================

  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  /** Dobavlja formu trenutnog koraka */
  getCurrentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.step3Form;
      default: return this.step1Form;
    }
  }

  // ==================
  // --- Event handleri ---
  // ==================

  /** Selektovanje zanimanja iz dropdown-a */
  selectZanimanje(id: number) {
    const control = this.step3Form.get('zanimanje');
    if (control?.enabled) {
      control.setValue(id);
      this.izabranoZanimanjeId = id;
      this.zanimanjeDropdownOpen = false;
    }
  }

  /** Handler za promenu datuma rođenja iz custom date picker-a */
  onDateSelected(date: Date | null) {
    if (date) {
      const isoDate = date.toISOString().split('T')[0]; // format YYYY-MM-DD
      this.step3Form.get('datumRodjenja')!.setValue(isoDate);
    } else {
      this.step3Form.get('datumRodjenja')!.setValue(null);
    }
    this.step3Form.get('datumRodjenja')!.markAsTouched();
    this.step3Form.get('datumRodjenja')!.updateValueAndValidity();
  }

  /** Handler za promenu selekcije veština checkbox-ovima */
  onVestinaChange(event: any) {
    const vestineArray = this.step3Form.get('vestine') as FormArray;
    const vestinaId = +event.target.value;

    if (event.target.checked) {
      vestineArray.push(this.fb.control(vestinaId));
    } else {
      const index = vestineArray.controls.findIndex(x => x.value === vestinaId);
      if (index !== -1) {
        vestineArray.removeAt(index);
      }
    }
    vestineArray.markAsTouched();
    vestineArray.updateValueAndValidity();
  }

  /** Handler za selekciju zanimanja preko HTML select-a */
  onZanimanjeSelected(event: any) {
    this.izabranoZanimanjeId = +event.target.value;
  }

/**
 * Glavna metoda za slanje forme i navigaciju između koraka
 */
handleSubmit() {
  // Dohvata trenutno aktivnu formu na osnovu trenutnog koraka
  const form = this.getCurrentForm();

  // Ako forma nije validna, obeleži sva polja kao "dodirnuta" da se prikažu greške i prekini izvršavanje
  if (!form.valid) {
    form.markAllAsTouched();
    return;
  }

  // Ako smo na poslednjem koraku, pripremi i pošalji podatke
  if (this.currentStep === this.totalSteps) {
    // Izvući confirmPassword iz step1Form da ga ne šaljemo na backend
    const { confirmPassword, ...step1DataWithoutConfirm } = this.step1Form.value;

    // Sastavi payload kombinujući podatke iz sva tri koraka
    // Koristi step1DataWithoutConfirm umesto celog step1Form.value da izostavi confirmPassword
    const payload = {
      ...step1DataWithoutConfirm,
      ...this.step2Form.value,
      ...this.step3Form.value,
    };

    // Ovde bi išao poziv backend servisu npr. this.authService.register(payload)...
    this.authService.register(payload).subscribe({
      next: (response)=>{
        console.log('Uspesna registracija', response);
        const email = this.step1Form.get('email')?.value || '[nepoznat email]';
        this.successMessage = `Na email: ${email} je poslat link za verifikaciju.`;
        this.formSubmitted = true;
         // Nakon 4 sekunde preusmeri korisnika na login stranicu
        setTimeout(() => {
        this.router.navigate(['/login']);
                }, 4000);
      },error: (error)=>{
        console.error('Greska u registraciji: ',error);
        this.successMessage = `Došlo je do greške prilikom registracije. Pokušajte ponovo.`;
      }
    });
  }else{
    this.nextStep();
  }
}


}
