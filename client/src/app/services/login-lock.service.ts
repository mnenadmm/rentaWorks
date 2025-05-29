import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginLockService {
  private maxAttempts = 3;
  private lockDuration = 30000; // 30 sekundi blokada
  private attempts = 0;
  private lockExpiration: number | null = null;

  constructor() { }

  canAttempt(): boolean {
    if (this.isLocked()) {
      return false;
    }
    return true;
  }

  recordAttempt(success: boolean): void {
    if (success) {
      this.reset();
    } else {
      this.attempts++;
      if (this.attempts >= this.maxAttempts) {
        this.lockExpiration = Date.now() + this.lockDuration;
      }
    }
  }

  isLocked(): boolean {
    if (this.lockExpiration && Date.now() < this.lockExpiration) {
      return true;
    }
    if (this.lockExpiration && Date.now() >= this.lockExpiration) {
      this.reset();
      return false;
    }
    return false;
  }

  getRemainingLockTime(): number {
    if (!this.lockExpiration) {
      return 0;
    }
    return Math.max(this.lockExpiration - Date.now(), 0);
  }

  reset(): void {
    this.attempts = 0;
    this.lockExpiration = null;
  }
}
