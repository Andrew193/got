import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicStoresHolderComponent } from './basic-stores-holder.component';

describe('BasicStoresHolderComponent', () => {
  let component: BasicStoresHolderComponent;
  let fixture: ComponentFixture<BasicStoresHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicStoresHolderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicStoresHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
