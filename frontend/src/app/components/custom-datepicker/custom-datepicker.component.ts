import { Component, EventEmitter, Output } from '@angular/core';

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

  @Output() dateSelected = new EventEmitter<Date>();

  constructor() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.generateCalendar();
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

  selectDay(day: number) {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.dateSelected.emit(this.selectedDate);
  }

  getMonthName() {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }
}
