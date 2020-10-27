import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Title } from '@angular/platform-browser';

import { RegistryComponent } from './registry.component';
import { RegistryService } from './registry.service';

describe('RegistryComponent', () => {
  let component: RegistryComponent;
  let fixture: ComponentFixture<RegistryComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistryComponent ],
      providers: [ RegistryService, Title ],
      imports: [ HttpClientTestingModule, MatTableModule, MatCardModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistryComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill the table with a list of docker images', waitForAsync(() => {
    const registryData = [
      {
        "metadata": [
          {
            "image_id": "911f580307ae",
            "image_size": 391.65,
            "tag": "7.5.0"
          }
        ],
        "name": "elasticsearch/elasticsearch"
      },
      {
        "metadata": [
          {
            "image_id": "3cab8e1b9802",
            "image_size": 63.42,
            "tag": "3.2.24"
          }
        ],
        "name": "etcd"
      },
    ];

    fixture.detectChanges();

    const req = httpTestingController.expectOne('/api/get_docker_registry');

    expect(req.request.method).toEqual('GET');

    req.flush(registryData);

    httpTestingController.verify();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.registry).toEqual(registryData);
      expect(component.columnsForImages).toEqual(['name', 'tags', 'image_id', 'image_size']);
      expectTableToMatchContent(fixture.nativeElement, [['Name', 'Tags', 'Image ID', 'Image Size MB'], ['elasticsearch/elasticsearch', '7.5.0', '911f580307ae', '391.65'], ['etcd', '3.2.24', '3cab8e1b9802', '63.42']]);
    })

  }));

});

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mat-header-row'))!;
}

function getFooterRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mat-footer-row'))!;
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.mat-row');
}

function getCells(row: Element): Element[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, 'mat-cell');
  if (!cells.length) {
    cells = getElements(row, 'td');
  }

  return cells;
}

function getHeaderCells(headerRow: Element): Element[] {
  let cells = getElements(headerRow, 'mat-header-cell');
  if (!cells.length) {
    cells = getElements(headerRow, 'th');
  }

  return cells;
}

function getFooterCells(footerRow: Element): Element[] {
  let cells = getElements(footerRow, 'mat-footer-cell');
  if (!cells.length) {
    cells = getElements(footerRow, 'td');
  }

  return cells;
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach(row => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  const rows = getRows(tableElement).map(row => getCells(row));
  actualTableContent = actualTableContent.concat(rows);

  getFooterRows(tableElement).forEach(row => {
    actualTableContent.push(getFooterCells(row));
  });

  // Convert the nodes into their text content;
  return actualTableContent.map(row => row.map(cell => cell.textContent!.trim()));
}

function expectTableToMatchContent(tableElement: Element, expected: any[]) {
  const missedExpectations: string[] = [];
  function checkCellContent(actualCell: string, expectedCell: string) {
  if (actualCell !== expectedCell) {
    missedExpectations.push(`Expected cell contents to be ${expectedCell} but was ${actualCell}`);
    }
  }

  const actual = getActualTableContent(tableElement);

  // Make sure the number of rows match
  if (actual.length !== expected.length) {
    missedExpectations.push(`Expected ${expected.length} total rows but got ${actual.length}`);
    fail(missedExpectations.join('\n'));
  }

  actual.forEach((row, rowIndex) => {
    const expectedRow = expected[rowIndex];

    // Make sure the number of cells match
    if (row.length !== expectedRow.length) {
      missedExpectations.push(`Expected ${expectedRow.length} cells in row but got ${row.length}`);
      fail(missedExpectations.join('\n'));
    }

    row.forEach((actualCell, cellIndex) => {
      const expectedCell = expectedRow ? expectedRow[cellIndex] : null;
      checkCellContent(actualCell, expectedCell);
    });
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
