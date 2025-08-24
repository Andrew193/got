import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectsHighlighterComponent } from './effects-highlighter.component';

describe('EffectsHighlighterComponent', () => {
  let component: EffectsHighlighterComponent;
  let fixture: ComponentFixture<EffectsHighlighterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EffectsHighlighterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EffectsHighlighterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
