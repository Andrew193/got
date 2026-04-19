import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { provideMockStore } from '@ngrx/store/testing';
import { DisplayRewardNames } from '../../../store/store.interfaces';
import { DisplayRewardInitialState } from '../../../store/reducers/display-reward.reducer';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        provideMockStore({
          initialState: { displayReward: DisplayRewardInitialState },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('cardCollectionName', DisplayRewardNames.summon);
    fixture.componentRef.setInput('index', 0);
    component = fixture.componentInstance;
    // Don't call detectChanges to avoid template rendering with empty card signal
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
