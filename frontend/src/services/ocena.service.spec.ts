import { TestBed } from '@angular/core/testing';

import { OcenaService } from './ocena.service';

describe('OcenaService', () => {
  let service: OcenaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcenaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
