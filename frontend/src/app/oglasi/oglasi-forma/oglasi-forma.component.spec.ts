import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OglasiFormaComponent } from './oglasi-forma.component';

describe('OglasiFormaComponent', () => {
  let component: OglasiFormaComponent;
  let fixture: ComponentFixture<OglasiFormaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OglasiFormaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OglasiFormaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
