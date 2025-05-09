import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDemoComponent } from './stream-demo.component';

describe('StreamDemoComponent', () => {
  let component: StreamDemoComponent;
  let fixture: ComponentFixture<StreamDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
