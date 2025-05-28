import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodrskaComponent } from './podrska.component';

describe('PodrskaComponent', () => {
  let component: PodrskaComponent;
  let fixture: ComponentFixture<PodrskaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodrskaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodrskaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
