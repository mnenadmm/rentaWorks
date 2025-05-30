import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registracija',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {
  korak = 1;
  ukupnoKoraka = 4;

  formaKorak1!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formaKorak1 = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      ime: ['', Validators.required],
      prezime: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lozinka: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  sledeciKorak() {
    if (this.korak === 1) {
      if (this.formaKorak1.invalid) {
        this.formaKorak1.markAllAsTouched();
        return;
      }
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

  submitRegistraciju() {
    alert('Registracija je završena!');
    this.korak = 1;
    this.formaKorak1.reset();
  }
}
