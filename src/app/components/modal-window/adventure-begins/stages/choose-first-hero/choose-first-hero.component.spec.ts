import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseFirstHeroComponent } from './choose-first-hero.component';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FakeMatBottomSheetRef } from '../../../../../test-related';

describe('ChooseFirstHeroComponent', () => {
  let component: ChooseFirstHeroComponent;
  let fixture: ComponentFixture<ChooseFirstHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseFirstHeroComponent],
      providers: [
        {
          provide: MatBottomSheetRef,
          useValue: FakeMatBottomSheetRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooseFirstHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ChooseFirstHeroComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
