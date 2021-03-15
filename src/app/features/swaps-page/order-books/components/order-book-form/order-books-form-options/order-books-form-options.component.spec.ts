import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBooksFormOptionsComponent } from './order-books-form-options.component';

describe('OrderBooksFormOptionsComponent', () => {
  let component: OrderBooksFormOptionsComponent;
  let fixture: ComponentFixture<OrderBooksFormOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderBooksFormOptionsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBooksFormOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
