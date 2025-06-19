/**
 * Interface za trenutnog korisnika
 * 
 */

export interface CurrentUserInterface {
    id: number,
    username : string,
    tip_korisnika :'admin' | 'pravno_lice' | 'fizicko_lice';
    aktivan : boolean
}
