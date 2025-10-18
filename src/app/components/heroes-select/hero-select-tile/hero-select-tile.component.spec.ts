import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSelectTileComponent } from './hero-select-tile.component';

describe('HeroSelectTileComponent', () => {
  let component: HeroSelectTileComponent;
  let fixture: ComponentFixture<HeroSelectTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSelectTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSelectTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
