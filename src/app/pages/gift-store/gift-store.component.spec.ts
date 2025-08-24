import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GiftStoreComponent} from './gift-store.component';

describe('GiftStoreComponent', () => {
  let component: GiftStoreComponent;
  let fixture: ComponentFixture<GiftStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftStoreComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GiftStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
