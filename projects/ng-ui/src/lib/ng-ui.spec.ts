import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgUi } from './ng-ui';

describe('NgUi', () => {
  let component: NgUi;
  let fixture: ComponentFixture<NgUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgUi],
    }).compileComponents();

    fixture = TestBed.createComponent(NgUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
