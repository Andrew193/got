import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AbstractGameFieldComponent} from './abstract-game-field.component';

describe('AbstractGameFieldComponent', () => {
  let component: AbstractGameFieldComponent;
  let fixture: ComponentFixture<AbstractGameFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbstractGameFieldComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AbstractGameFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
