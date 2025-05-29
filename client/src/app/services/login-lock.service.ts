import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginLockService {
  private maxAttempts = 3;
  private lockoutDurationMs = 30000; // 30 sekundi

  private attemptsKey = 'loginAttempts';
  private lockUntilKey = 'loginLockUntil';

  private remainingTimeSubject = new BehaviorSubject<number>(0);
  remainingTime$ = this.remainingTimeSubject.asObservable();

  private countdownSub?: Subscription;

  constructor() {
    this.checkLockStatus();
  }

  private getAttempts(): number {
    return Number(localStorage.getItem(this.attemptsKey)) || 0;
  }

  private setAttempts(val: number) {
    localStorage.setItem(this.attemptsKey, val.toString());
  }

  private getLockUntil(): number {
    return Number(localStorage.getItem(this.lockUntilKey)) || 0;
  }

  private setLockUntil(timestamp: number) {
    localStorage.setItem(this.lockUntilKey, timestamp.toString());
  }

  canAttempt(): boolean {
    const now = Date.now();
    return now >= this.getLockUntil();
  }

  isLocked(): boolean {
    return !this.canAttempt();
  }

  getRemainingLockTime(): number {
    const now = Date.now();
    const lockUntil = this.getLockUntil();
    return lockUntil > now ? lockUntil - now : 0;
  }

  recordAttempt(success: boolean) {
    if (this.isLocked()) {
      return; // ne dozvoljavamo nove pokušaje dok je zaključano
    }

    if (success) {
      this.setAttempts(0);
      this.clearLock();
    } else {
      let attempts = this.getAttempts() + 1;
      this.setAttempts(attempts);

      if (attempts >= this.maxAttempts) {
        this.lockUser();
      }
    }
  }

  private lockUser() {
    const lockUntil = Date.now() + this.lockoutDurationMs;
    this.setLockUntil(lockUntil);
    this.startCountdown();
  }

  private clearLock() {
    localStorage.removeItem(this.lockUntilKey);
    this.remainingTimeSubject.next(0);
    this.stopCountdown();
  }

  private startCountdown() {
    this.stopCountdown();

    this.countdownSub = interval(1000).subscribe(() => {
      const remaining = this.getRemainingLockTime();
      this.remainingTimeSubject.next(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        this.setAttempts(0);
        this.clearLock();
      }
    });
  }

  private stopCountdown() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = undefined;
    }
  }

  private checkLockStatus() {
    if (this.isLocked()) {
      this.startCountdown();
    } else {
      this.setAttempts(0);
      this.clearLock();
    }
  }
}
