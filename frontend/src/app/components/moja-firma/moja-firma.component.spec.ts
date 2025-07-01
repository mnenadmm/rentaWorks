import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MojaFirmaComponent } from './moja-firma.component';

describe('MojaFirmaComponent', () => {
  let component: MojaFirmaComponent;
  let fixture: ComponentFixture<MojaFirmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MojaFirmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MojaFirmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
