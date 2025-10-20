import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzurirajOglasComponent } from './azuriraj-oglas.component';

describe('AzurirajOglasComponent', () => {
  let component: AzurirajOglasComponent;
  let fixture: ComponentFixture<AzurirajOglasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AzurirajOglasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AzurirajOglasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
