import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoDetectDialogComponent } from './auto-detect-dialog.component';

describe('AutoDetectDialogComponent', () => {
  let component: AutoDetectDialogComponent;
  let fixture: ComponentFixture<AutoDetectDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AutoDetectDialogComponent]
    });
    fixture = TestBed.createComponent(AutoDetectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
