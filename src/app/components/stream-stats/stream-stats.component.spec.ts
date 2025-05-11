import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamStatsComponent } from './stream-stats.component';

describe('StreamStatsComponent', () => {
  let component: StreamStatsComponent;
  let fixture: ComponentFixture<StreamStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
