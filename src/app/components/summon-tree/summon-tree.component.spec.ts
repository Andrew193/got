import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SummonTreeComponent} from './summon-tree.component';

describe('SummonTreeComponent', () => {
  let component: SummonTreeComponent;
  let fixture: ComponentFixture<SummonTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummonTreeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SummonTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
