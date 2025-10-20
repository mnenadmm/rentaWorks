import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IzlistajFirmeComponent } from './izlistaj-firme.component';

describe('IzlistajFirmeComponent', () => {
  let component: IzlistajFirmeComponent;
  let fixture: ComponentFixture<IzlistajFirmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IzlistajFirmeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IzlistajFirmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
