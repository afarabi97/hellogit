import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { remove_styles_from_dom } from '../../../../../../../static-data/functions/clean-dom.function';
import { ToolsModule } from '../../../tools.module';
import { UpdateDocumentationMessageComponent } from './update-documentation-message.component';

describe('UpdateDocumentationMessageComponent', () => {
  let component: UpdateDocumentationMessageComponent;
  let fixture: ComponentFixture<UpdateDocumentationMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ToolsModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDocumentationMessageComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => remove_styles_from_dom());

  it('should create UpdateDocumentationMessageComponent', () => {
    expect(component).toBeTruthy();
  });
});
