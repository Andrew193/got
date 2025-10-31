import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../data-inputs/text-input/text-input.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { BaseSelectComponent } from '../../data-inputs/base-select/base-select.component';
import { MatIcon } from '@angular/material/icon';
import { MatMiniFabButton } from '@angular/material/button';

export const TableImports = [
  MatTable,
  MatSort,
  MatColumnDef,
  MatHeaderCell,
  MatCell,
  MatCellDef,
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRow,
  MatRowDef,
  MatPaginator,
  MatProgressSpinner,
  MatSortHeader,
  MatNoDataRow,
  ReactiveFormsModule,
  TextInputComponent,
  NgTemplateOutlet,
  NgClass,
  BaseSelectComponent,
  MatIcon,
  MatMiniFabButton,
];
