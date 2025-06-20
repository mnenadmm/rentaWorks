/**
 * Interface za trenutnog korisnika
 * 
 */

export interface CurrentUserInterface {
  id: number;
  username: string;
  tip_korisnika: 'admin' | 'pravno_lice' | 'fizicko_lice';
  aktivan: boolean;
  ime?: string;
  prezime?: string;
  email?: string;
  telefon?: string;
  adresa?: string;
  grad?: string;
  drzava?: string;
  datum_registracije?: string;
  profilna_slika?: string | null;
  biografija?: string | null;
  verifikovan_email?: boolean;
}


