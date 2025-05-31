import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent  {
  korak = 1;
  ukupnoKoraka = 4;

  formaKorak1: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formaKorak1 = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      ime: ['', Validators.required],
      prezime: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lozinka: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  sledeciKorak() {
    if (this.korak === 1 && this.formaKorak1.invalid) {
      this.formaKorak1.markAllAsTouched();
      return;
    }
    if (this.korak < this.ukupnoKoraka) {
      this.korak++;
    }
  }

  prethodniKorak() {
    if (this.korak > 1) {
      this.korak--;
    }
  }
  submit() {
  // Ovde ide logika za slanje podataka na server ili završetak registracije
  alert('Registracija završena! Podaci su poslati.');
  // Primer: resetovanje forme i vraćanje na prvi korak
  this.korak = 1;
  this.formaKorak1.reset();
}
}
