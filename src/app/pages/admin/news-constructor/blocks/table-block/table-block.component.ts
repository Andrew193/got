import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  TableBlock,
  WatchtowerTableColumn,
} from '../../../../../models/watchtower/watchtower.model';
import { TableEditChangeEvent } from '../../../../../models/table/abstract-table.model';
import { WatchtowerGenericTableComponent } from '../../../../watchtower/watchtower-generic-table/watchtower-generic-table.component';

@Component({
  selector: 'app-table-block',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, WatchtowerGenericTableComponent],
  templateUrl: './table-block.component.html',
  styleUrl: './table-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBlockComponent implements OnInit {
  block = input.required<TableBlock>();
  blockChange = output<TableBlock>();
  remove = output<void>();

  columns = signal<WatchtowerTableColumn[]>([]);
  rows = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.columns.set(this.block().columns);
    this.rows.set(this.block().rows);
  }

  onEditChange(event: TableEditChangeEvent): void {
    const updatedBlock: TableBlock = {
      type: 'table',
      columns: event.columns,
      rows: event.rows,
    };

    this.columns.set(event.columns);
    this.rows.set(event.rows);
    this.blockChange.emit(updatedBlock);
  }
}
