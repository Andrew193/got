import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroesSelectPreviewComponent } from './heroes-select-preview.component';

describe('HeroesChooseComponent', () => {
  let component: HeroesSelectPreviewComponent;
  let fixture: ComponentFixture<HeroesSelectPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesSelectPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroesSelectPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
