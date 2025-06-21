import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastStreamComponent } from './past-stream.component';

describe('PastStreamComponent', () => {
  let component: PastStreamComponent;
  let fixture: ComponentFixture<PastStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
