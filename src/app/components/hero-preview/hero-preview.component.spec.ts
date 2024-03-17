import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroPreviewComponent } from './hero-preview.component';

describe('HeroPreviewComponent', () => {
  let component: HeroPreviewComponent;
  let fixture: ComponentFixture<HeroPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroPreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeroPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
