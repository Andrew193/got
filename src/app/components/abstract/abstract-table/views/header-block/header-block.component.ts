import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCell, MatCellDef, MatHeaderCell, MatHeaderCellDef } from '@angular/material/table';
import { TableColumns } from '../../../../../models/table/abstract-table.model';
import { MatSortHeader } from '@angular/material/sort';

@Component({
  selector: 'app-header-block',
  imports: [MatHeaderCell, MatCell, MatCellDef, MatHeaderCellDef, MatSortHeader],
  templateUrl: './header-block.component.html',
  styleUrl: './header-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderBlockComponent<T> {
  column = input.required<TableColumns<T>>();
}
