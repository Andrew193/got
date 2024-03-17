import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TavernaInnerContainerComponent } from './taverna-inner-container.component';

describe('TavernaInnerContainerComponent', () => {
  let component: TavernaInnerContainerComponent;
  let fixture: ComponentFixture<TavernaInnerContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TavernaInnerContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TavernaInnerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
