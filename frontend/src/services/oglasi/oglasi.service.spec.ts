import { TestBed } from '@angular/core/testing';

import { OglasiService } from './oglasi.service';

describe('OglasiService', () => {
  let service: OglasiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OglasiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
