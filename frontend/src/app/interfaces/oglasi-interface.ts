export interface OglasiInterface {
  id: number;
  naslov: string;
  opis: string;
  lokacija: string;
  datum_objave: string;
  firma_id: number;
  firmaNaziv?: string;
  firmaLogo?: string;
   zanimanja?: string[]; 
}
