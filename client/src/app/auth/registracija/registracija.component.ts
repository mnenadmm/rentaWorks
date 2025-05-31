import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent  {
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
      lozinka: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  nextStep() {
    if(this.currentStep === 1 && this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submit() {
    if (this.step1Form.valid) {
      // Ovde ide logika za submit (poziv API, itd)
      alert('Registracija poslata!');
    } else {
      this.step1Form.markAllAsTouched();
      this.currentStep = 1;
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}