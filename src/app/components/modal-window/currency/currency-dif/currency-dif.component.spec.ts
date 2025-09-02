import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyDifComponent } from './currency-dif.component';

describe('CurrencyDifComponent', () => {
  let component: CurrencyDifComponent;
  let fixture: ComponentFixture<CurrencyDifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyDifComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyDifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
