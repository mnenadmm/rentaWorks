import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmaIzmenaComponent } from './firma-izmena.component';

describe('FirmaIzmenaComponent', () => {
  let component: FirmaIzmenaComponent;
  let fixture: ComponentFixture<FirmaIzmenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FirmaIzmenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmaIzmenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
