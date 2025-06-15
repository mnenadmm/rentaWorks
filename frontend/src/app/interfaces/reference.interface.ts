/**
 * Interfejsi za Zanimanje, vestine usera kao i za drzavljanstvo
 * 
 */
export interface Zanimanje {
  id: number;
  naziv: string;
}

export interface Vestina {
  id: number;
  naziv: string;
}

export interface Drzava {
  code: string;
  name: string;
}