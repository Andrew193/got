import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        {
          provide: MatBottomSheetRef,
          useValue: FakeMatBottomSheetRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('WelcomeComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
