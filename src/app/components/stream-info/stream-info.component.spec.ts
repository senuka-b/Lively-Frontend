import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamInfoComponent } from './stream-info.component';

describe('StreamInfoComponent', () => {
  let component: StreamInfoComponent;
  let fixture: ComponentFixture<StreamInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
