import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BasePaginationComponent} from './base-pagination.component';

describe('BasePaginationComponent', () => {
  let component: BasePaginationComponent;
  let fixture: ComponentFixture<BasePaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasePaginationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BasePaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
