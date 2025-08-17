import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicModalStrategyTemplateComponent } from './basic-modal-strategy-template.component';

describe('BasicModalStrategyTemplateComponent', () => {
  let component: BasicModalStrategyTemplateComponent;
  let fixture: ComponentFixture<BasicModalStrategyTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicModalStrategyTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicModalStrategyTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
