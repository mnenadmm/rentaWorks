/**
 * Interfejs za firmu
 */

export interface Firma_interface {
  id?: number;           // opcionalno, jer će baza dodeliti ID
  naziv: string;
  pib: string;
  adresa?: string;
  telefon?: string;
  email?: string;
  web_sajt?: string;
  logo_url?: string;
  vlasnik_id?: number;   // opcionalno, backend može da doda
  logo?: string;
}
