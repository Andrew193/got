import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdventureBeginsComponent, Callback } from './adventure-begins.component';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import Spy = jasmine.Spy;
import { MatDialogRef } from '@angular/material/dialog';
import { FakeMatDialogRef } from '../../../test-related';

describe('AdventureBeginsComponent', () => {
  let component: AdventureBeginsComponent;
  let fixture: ComponentFixture<AdventureBeginsComponent>;
  let callbackSpy: Spy;

  beforeEach(async () => {
    callbackSpy = jasmine.createSpy('callback', () => {
      console.log('Adventure Begins Callback');
    });

    const data: Callback = {
      callback: callbackSpy,
    };

    await TestBed.configureTestingModule({
      imports: [AdventureBeginsComponent],
      providers: [
        {
          provide: DYNAMIC_COMPONENT_DATA,
          useValue: data,
        },
        {
          provide: MatDialogRef,
          useValue: FakeMatDialogRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdventureBeginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('AdventureBeginsComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
