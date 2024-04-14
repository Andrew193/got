import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TavernaComponent } from './taverna.component';

describe('TavernaComponent', () => {
  let component: TavernaComponent;
  let fixture: ComponentFixture<TavernaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TavernaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TavernaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
