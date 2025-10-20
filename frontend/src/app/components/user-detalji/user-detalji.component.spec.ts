import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetaljiComponent } from './user-detalji.component';

describe('UserDetaljiComponent', () => {
  let component: UserDetaljiComponent;
  let fixture: ComponentFixture<UserDetaljiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetaljiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetaljiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
