import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamQuickSettingsComponent } from './stream-quick-settings.component';

describe('StreamQuickSettingsComponent', () => {
  let component: StreamQuickSettingsComponent;
  let fixture: ComponentFixture<StreamQuickSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamQuickSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamQuickSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
