import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OglasiListaComponent } from './oglasi-lista.component';

describe('OglasiListaComponent', () => {
  let component: OglasiListaComponent;
  let fixture: ComponentFixture<OglasiListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OglasiListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OglasiListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
