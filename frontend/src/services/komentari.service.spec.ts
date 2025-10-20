import { TestBed } from '@angular/core/testing';

import { KomentariService } from './komentari.service';

describe('KomentariService', () => {
  let service: KomentariService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KomentariService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
