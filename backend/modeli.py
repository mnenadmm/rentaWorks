from extensions import db
from datetime import datetime
import enum


korisnik_zanimanje = db.Table(
    'korisnik_zanimanje',
    db.Column('korisnik_id', db.Integer, db.ForeignKey('korisnici.id'), primary_key=True),
    db.Column('zanimanje_id', db.Integer, db.ForeignKey('zanimanja.id'), primary_key=True)
)
class Zanimanje(db.Model):
    __tablename__ = 'zanimanja'
    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Zanimanje {self.naziv}>"
    
korisnik_vestina = db.Table(
    'korisnik_vestina',
    db.Column('korisnik_id', db.Integer, db.ForeignKey('korisnici.id'), primary_key=True),
    db.Column('vestina_id', db.Integer, db.ForeignKey('vestine.id'), primary_key=True)
)
class TipKorisnikaEnum(enum.Enum):
    fizicko_lice = "fizicko_lice"
    pravno_lice = "pravno_lice"
    admin = "admin"
#model sadrzi podatke o korisniku1
class Korisnik(db.Model):

    __tablename__ = "korisnici"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    ime = db.Column(db.String(50), nullable=False)
    prezime = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    lozinka = db.Column(db.String(255), nullable=False)
    tip_korisnika = db.Column(
    db.Enum(
        TipKorisnikaEnum,
        name="tipkorisnika"  
    ),
    nullable=False
)
    datum_rodjenja = db.Column(db.Date, nullable=True)
    datum_registracije = db.Column(db.DateTime, default=datetime.utcnow)
    aktivan = db.Column(db.Boolean, default=True)
    verifikovan_email = db.Column(db.Boolean, default=False)
    # dodati jmbg
    # dodati broj adrese
    profilna_slika = db.Column(db.String(255), nullable=True)
    biografija = db.Column(db.Text, nullable=True)
    grad = db.Column(db.String(100), nullable=True)
    adresa = db.Column(db.String(255), nullable=True)
    broj_adrese = db.Column(db.Integer, nullable=True)

    drzavljanstvo = db.Column(db.String(100), nullable=True)
    telefon = db.Column(db.String(30), nullable=True)
    block_user = db.Column(db.Boolean, default=False, nullable=False)
    prva_rola = db.Column(db.Boolean, default=False, nullable=False)
    druga_rola = db.Column(db.Boolean, default=False, nullable=False)
    treca_rola = db.Column(db.Boolean, default=False, nullable=False)
    zanimanja = db.relationship('Zanimanje', secondary='korisnik_zanimanje', backref='korisnici')
    vestine = db.relationship('Vestina', secondary='korisnik_vestina', backref='korisnici')
    firme = db.relationship('Firma', backref='vlasnik')  # lista firmi za korisnika
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "ime": self.ime,
            "prezime": self.prezime,
            "email": self.email,
            "adresa": self._puna_adresa(),
            "tip_korisnika": self.tip_korisnika.value if self.tip_korisnika else None,
            "datum_registracije": self.datum_registracije.isoformat() if self.datum_registracije else None,
            "datum_rodjenja": self.datum_rodjenja.isoformat() if self.datum_rodjenja else None,
            "aktivan": self.aktivan,
            "verifikovan_email": self.verifikovan_email,
            "profilna_slika": self.profilna_slika,
            "biografija": self.biografija,
            "grad": self.grad,
            "drzava": self.drzavljanstvo,
            "telefon": self.telefon,
            "block_user": self.block_user,
            "prva_rola": self.prva_rola,
            "druga_rola": self.druga_rola,
            "treca_rola": self.treca_rola,
            "zanimanja": [z.naziv for z in self.zanimanja],
            "vestine": [v.naziv for v in self.vestine],
            "ima_firmu": len(self.firme) > 0  # True ako ima barem jedna firma, False ako nema
        }
    def _puna_adresa(self):
        delovi = []
        if self.adresa:
            delovi.append(self.adresa)
        if self.broj_adrese:
            delovi.append(str(self.broj_adrese))
        if self.grad:
            delovi.append(self.grad)
        return ", ".join(delovi) if delovi else None
    def __repr__(self):
        return f"<Korisnik {self.ime} {self.prezime}>"

class Vestina(db.Model):
    __tablename__ = 'vestine'
    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Vestina {self.naziv}>"

#Tabela sadrzi podatke o firmi
class Firma(db.Model):
    __tablename__ = "firme"

    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(150), nullable=False)
    pib = db.Column(db.String(20), unique=True, nullable=False)  # porezni identifikacioni broj
    adresa = db.Column(db.String(255), nullable=True)
    telefon = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    web_sajt = db.Column(db.String(255), nullable=True)
    logo = db.Column(db.String(255), nullable=True)
    vlasnik_id = db.Column(db.Integer, db.ForeignKey('korisnici.id'), nullable=False)
    def to_dict(self):
        return {
            "id": self.id,
            "naziv": self.naziv,
            "pib": self.pib,
            "adresa": self.adresa,
            "telefon": self.telefon,
            "email": self.email,
            "web_sajt": self.web_sajt,
            "vlasnik_id": self.vlasnik_id,
            "logo_url": self.logo 
        }

    def __repr__(self):
        return f"<Firma {self.naziv}>"





