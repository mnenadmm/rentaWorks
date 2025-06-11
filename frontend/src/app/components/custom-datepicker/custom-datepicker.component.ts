import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output
} from '@angular/core';

@Component({
  selector: 'app-custom-datepicker',
  standalone: false,
  templateUrl: './custom-datepicker.component.html',
  styleUrl: './custom-datepicker.component.css'
})
export class CustomDatepickerComponent {
  currentYear: number;
  currentMonth: number;
  days: number[] = [];
  selectedDate?: Date;
  showCalendar = false;
  showYearPicker = false;
  years: number[] = [];
  isMobile = false;
  maxDate: string;
  // Emituje izabrani datum ka roditeljskoj komponenti
  @Output() dateSelected = new EventEmitter<Date | null>();

  constructor(private eRef: ElementRef) {
    const today = new Date();
    this.currentYear = today.getFullYear(); // Postavlja trenutnu godinu
    this.currentMonth = today.getMonth();   // Postavlja trenutni mesec
    this.generateCalendar();                // Inicijalno generiše dane u mesecu
    this.generateYears();                   // Popunjava listu godina

  // 📱 Detekcija mobilnog uređaja
  this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
   // Postavi maxDate u formatu yyyy-MM-dd (standard za <input type="date">)
  this.maxDate = today.toISOString().split('T')[0];
  }

  // Zatvara kalendar ako se klikne van komponente
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showCalendar = false;
      this.showYearPicker = false;
    }
  }
 
onMobileDateChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input?.value) {
    const selected = new Date(input.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected <= today) {
      this.selectedDate = selected;
      this.dateSelected.emit(selected);  // emituj datum roditelju
    } else {
      // možeš emitovati null ili neki signal da datum nije validan
      this.dateSelected.emit(null);
    }
  }
}

  // Otvara/zatvara kalendar
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    this.showYearPicker = false; // Zatvara picker ako je otvoren
  }

  // Pravi listu godina od trenutne godine do 1930
  generateYears() {
    const current = new Date().getFullYear();
    for (let year = current; year >= 1930; year--) {
      this.years.push(year);
    }
  }

  // Generiše dane za trenutni mesec
  generateCalendar() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  // Pomera prikaz na prethodni mesec
  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  // Pomera prikaz na sledeći mesec
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  // Proverava da li je dan u budućnosti (nije dozvoljen za selekciju)
  isFutureDate(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  }

  // Selektuje dan i zatvara kalendar ako je validan
  selectDay(day: number) {
    const selected = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();
    if (selected <= today) {
      this.selectedDate = selected;
      this.dateSelected.emit(selected); // Obaveštava roditelja
      this.showCalendar = false;
      this.showYearPicker = false;
    }
  }

  // Vraća naziv trenutnog meseca
  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', {
      month: 'long'
    });
  }

  // Otvara/zatvara prikaz za izbor godine
  toggleYearPicker() {
    this.showYearPicker = !this.showYearPicker;
  }

  // Selektuje godinu i osvežava prikaz
  selectYear(year: number) {
    this.currentYear = year;
    this.showYearPicker = false;
    this.generateCalendar();
  }
}
