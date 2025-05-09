import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamShareLinkComponent } from './stream-share-link.component';

describe('StreamShareLinkComponent', () => {
  let component: StreamShareLinkComponent;
  let fixture: ComponentFixture<StreamShareLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamShareLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamShareLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
