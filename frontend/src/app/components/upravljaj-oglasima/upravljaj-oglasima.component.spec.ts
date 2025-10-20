import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpravljajOglasimaComponent } from './upravljaj-oglasima.component';

describe('UpravljajOglasimaComponent', () => {
  let component: UpravljajOglasimaComponent;
  let fixture: ComponentFixture<UpravljajOglasimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpravljajOglasimaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpravljajOglasimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
