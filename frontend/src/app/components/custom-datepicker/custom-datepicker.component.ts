import { Component, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Component({
  selector: 'app-custom-datepicker',
  standalone: false,
  templateUrl: './custom-datepicker.component.html',
  styleUrl: './custom-datepicker.component.css'
})
export class CustomDatepickerComponent {
  currentYear: number;
  currentMonth: number; // 0-based (0 = januar)
  days: number[] = [];
  selectedDate?: Date;
   showCalendar = false;
  showYearPicker = false;
  years: number[] = [];
  @Output() dateSelected = new EventEmitter<Date>();

  constructor(private eRef: ElementRef) {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.generateCalendar();
    this.generateYears();
    
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showCalendar = false;
      this.showYearPicker = false;
    }
  }
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    this.showYearPicker = false;
  }
    generateYears() {
    const current = new Date().getFullYear();
    for (let year = current; year >= 1930; year--) {
      this.years.push(year);
    }
  }
  generateCalendar() {
    // Broj dana u mesecu
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }
  isFutureDate(day: number): boolean {
  const date = new Date(this.currentYear, this.currentMonth, day);
  const today = new Date();
  // Poništavanje vremena da poređenje bude po datumu
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
}
  selectDay(day: number) {
    const selected = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();

    if (selected <= today) {
      this.selectedDate = selected;
      this.dateSelected.emit(selected);
      this.showCalendar = false;
    }
  }

  getMonthName() {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }
   toggleYearPicker() {
    this.showYearPicker = !this.showYearPicker;
  }
  selectYear(year: number) {
    this.currentYear = year;
    this.showYearPicker = false;
    this.generateCalendar();
  }
}
