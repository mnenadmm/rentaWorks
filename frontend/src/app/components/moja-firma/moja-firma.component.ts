import { Component, OnInit } from '@angular/core';
import { FirmaService } from '../../../services/firma.service';
import { Firma_interface } from '../../interfaces/firma-interface';
import { error } from 'console';
@Component({
  selector: 'app-moja-firma',
  standalone: false,
  templateUrl: './moja-firma.component.html',
  styleUrl: './moja-firma.component.css'
})
export class MojaFirmaComponent implements OnInit{
  firmaPostoji: boolean | null = null; // null dok čekamo backend
  firma: Firma_interface | null = null;
  errorMessage: string | null = null;
  constructor(private firmaService: FirmaService){};
  ngOnInit(): void {
    this.firmaService.dohvatiMojuFirmu().subscribe({
      next:(res : any)=>{
        if(res.firma){
          this.firma = res.firma;
          console.log(this.firma)
          
          this.firmaPostoji = true;
        }else {
          this.errorMessage ="" 
          this.firmaPostoji = true;
        }},error: (err)=>{
            this.firmaPostoji = false;
            this.errorMessage = err.error?.error || 'Greška pri učitavanju firme.';
        }
    })
  };
}
