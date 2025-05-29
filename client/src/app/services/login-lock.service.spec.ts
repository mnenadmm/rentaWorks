import { TestBed } from '@angular/core/testing';

import { LoginLockService } from './login-lock.service';

describe('LoginLockService', () => {
  let service: LoginLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginLockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
