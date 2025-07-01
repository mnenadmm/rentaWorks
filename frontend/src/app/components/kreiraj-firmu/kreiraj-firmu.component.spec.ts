import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KreirajFirmuComponent } from './kreiraj-firmu.component';

describe('KreirajFirmuComponent', () => {
  let component: KreirajFirmuComponent;
  let fixture: ComponentFixture<KreirajFirmuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KreirajFirmuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KreirajFirmuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
