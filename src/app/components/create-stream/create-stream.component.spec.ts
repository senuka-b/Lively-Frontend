import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStreamComponent } from './create-stream.component';

describe('CreateStreamComponent', () => {
  let component: CreateStreamComponent;
  let fixture: ComponentFixture<CreateStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
