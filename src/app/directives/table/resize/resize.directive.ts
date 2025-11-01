import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Inject,
  input,
  Input,
  NgZone,
  OnDestroy,
  output,
  Output,
  Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TableColumns } from '../../../models/table/abstract-table.model';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';

type ResizeCfg = {
  storageKey?: string;
  minWidth?: number;
  maxWidth?: number;
  handleWidth?: number;
  autosave?: boolean;
};

@Directive({
  selector: '[appTableResize]',
})
export class TableResizeDirective<T> implements AfterViewInit, OnDestroy {
  resizeActive = input(true);
  applyResize = input(true);
  columns = input<TableColumns<T>[]>([]);
  tableName = input('');
  localStorageService = inject(LocalStorageService);

  inited = false;

  @Input('appTableResize') cfg: ResizeCfg | '' = {};
  @Output() columnWidthChange = new EventEmitter<{ alias: string; width: number }>();
  resizeStoped = output<number>();

  private destroyFns: (() => void)[] = [];
  private table!: HTMLTableElement;
  private moving?: {
    alias: string;
    startX: number;
    startW: number;
    th: HTMLTableCellElement;
  };

  private get conf(): Required<ResizeCfg> {
    const c = this.cfg && typeof this.cfg === 'object' ? this.cfg : {};

    return {
      storageKey: c.storageKey ?? this.inferStorageKey(),
      minWidth: c.minWidth ?? 80,
      maxWidth: c.maxWidth ?? 1200,
      handleWidth: c.handleWidth ?? 10,
      autosave: c.autosave ?? true,
    };
  }

  constructor(
    private el: ElementRef<HTMLElement>,
    private r: Renderer2,
    private zone: NgZone,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    effect(() => {
      const newColumns = this.columns();

      queueMicrotask(() => {
        if (this.inited) {
          this.reinstallHandles();
        }

        this.inited = true;
      });
    });
  }

  ngAfterViewInit(): void {
    const applyResize = this.applyResize();
    const resizeActive = this.resizeActive();

    this.table = this.el.nativeElement as HTMLTableElement;
    this.r.setStyle(this.table, 'table-layout', 'fixed');

    if (resizeActive) {
      this.restoreWidths();

      this.installHandles();

      this.zone.runOutsideAngular(() => {
        const up = this.r.listen(this.doc, 'mouseup', () => this.stopResizing());
        const move = this.r.listen(this.doc, 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
        const dbl = this.r.listen(this.doc, 'dblclick', (e: MouseEvent) => this.onDblClick(e));

        this.destroyFns.push(up, move, dbl);
      });
    }

    if (!resizeActive && applyResize) {
      this.restoreWidths();
    }
  }

  ngOnDestroy(): void {
    this.destroyFns.forEach(f => f());
  }

  private installHandles(): void {
    const headers = this.table.querySelectorAll<HTMLTableCellElement>('th[mat-header-cell]');

    headers.forEach(th => {
      if (th.querySelector(':scope > .col-resize-handle')) return;

      this.r.setStyle(th, 'position', 'relative');

      const handle = this.r.createElement('div') as HTMLDivElement;

      this.r.addClass(handle, 'col-resize-handle');
      this.r.setStyle(handle, 'position', 'absolute');
      this.r.setStyle(handle, 'top', '0');
      this.r.setStyle(handle, 'right', '0');
      this.r.setStyle(handle, 'height', '100%');
      this.r.setStyle(handle, 'width', `${this.conf.handleWidth}px`);
      this.r.setStyle(handle, 'cursor', 'col-resize');
      this.r.setStyle(handle, 'user-select', 'none');
      this.r.setStyle(handle, 'touch-action', 'none');
      this.r.setStyle(handle, 'z-index', '2');

      const line = this.r.createElement('span') as HTMLSpanElement;

      this.r.addClass(line, 'col-resize-line');
      this.r.setStyle(line, 'position', 'absolute');
      this.r.setStyle(line, 'left', '50%');
      this.r.setStyle(line, 'top', '0');
      this.r.setStyle(line, 'transform', 'translateX(-50%)');
      this.r.setStyle(line, 'width', '1px');
      this.r.setStyle(line, 'height', '100%');
      this.r.setStyle(line, 'opacity', '0.35');
      this.r.appendChild(handle, line);

      const downOff = this.r.listen(handle, 'mousedown', (e: MouseEvent) =>
        this.onMouseDown(e, th),
      );

      this.destroyFns.push(downOff);

      this.r.appendChild(th, handle);
    });
  }

  private reinstallHandles(): void {
    const handles = this.table.querySelectorAll('.col-resize-handle');

    handles.forEach(h => h.remove());
    this.installHandles();
  }

  private onMouseDown(e: MouseEvent, th: HTMLTableCellElement): void {
    if (this.table.classList.contains('equal-cols')) return;

    e.preventDefault();
    const alias = this.pickAlias(th);

    if (!alias) return;

    const rect = th.getBoundingClientRect();

    this.moving = {
      alias,
      startX: e.clientX,
      startW: rect.width,
      th,
    };

    this.doc.body.classList.add('resizing-col');
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.moving) return;
    const dx = e.clientX - this.moving.startX;
    const next = this.moving.startW + dx;

    const { minWidth, maxWidth } = this.conf;

    // @ts-ignore
    console.log(next, this.moving.th.clientWidth);

    if (next < minWidth || next > maxWidth) {
      this.applyWidth(this.moving.th, this.moving.th.clientWidth);
    } else {
      this.applyWidth(this.moving.th, next);
      this.columnWidthChange.emit({ alias: this.moving.alias, width: next });
    }
  }

  private stopResizing(): void {
    if (!this.moving) return;

    const { alias, th } = this.moving;
    const w = th.getBoundingClientRect().width;

    if (this.conf.autosave) this.saveWidth(alias, w);

    this.doc.body.classList.remove('resizing-col');

    this.moving = undefined;
    this.resizeStoped.emit(new Date().getTime());
  }

  private onDblClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    if (!target.closest('.col-resize-handle')) return;

    const th = target.closest('th[mat-header-cell]') as HTMLTableCellElement | null;

    if (!th) return;
    const alias = this.pickAlias(th);

    if (!alias) return;

    const best = this.measureBestWidth(alias, th);

    this.applyWidth(th, best);
    this.columnWidthChange.emit({ alias, width: best });
    if (this.conf.autosave) this.saveWidth(alias, best);
  }

  private pickAlias(th: HTMLTableCellElement): string | null {
    const cls = Array.from(th.classList).find(c => c.startsWith('mat-column-'));

    return cls ? cls.replace('mat-column-', '') : null;
  }

  private applyWidth(th: HTMLTableCellElement, widthPx: number): void {
    this.r.setStyle(th, 'width', `${widthPx}px`);
    this.r.setStyle(th, 'max-width', `${widthPx}px`);
    this.r.setStyle(th, 'min-width', `${widthPx}px`);

    const alias = this.pickAlias(th);

    if (!alias) return;
    const selector = `.mat-column-${alias}`;
    const cells = this.table.querySelectorAll<HTMLTableCellElement>(`td${selector}`);

    cells.forEach(td => {
      this.r.setStyle(td, 'width', `${widthPx}px`);
      this.r.setStyle(td, 'max-width', `${widthPx}px`);
      this.r.setStyle(td, 'min-width', `${widthPx}px`);
    });
  }

  private inferStorageKey(): string {
    const id = this.table?.id || '';
    const path = location?.pathname || '';

    return this.tableName() || `table-resize:${path}:${id || 'default'}`;
  }

  private saveWidth(alias: string, width: number): void {
    try {
      debugger;
      const key = this.conf.storageKey;
      const raw = this.localStorageService.getItem(key);
      const map = raw ? (raw as Record<string, number>) : {};

      map[alias] = Math.round(width);
      this.localStorageService.setItem(key, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  private restoreWidths(): void {
    try {
      const raw = this.localStorageService.getItem(this.conf.storageKey);

      if (!raw) return;
      const map = raw as Record<string, number>;
      const headers = this.table.querySelectorAll<HTMLTableCellElement>('th[mat-header-cell]');

      headers.forEach(th => {
        const alias = this.pickAlias(th);

        if (!alias) return;
        const w = map[alias];

        if (typeof w === 'number' && w > 0) {
          this.applyWidth(th, w);
        }
      });
    } catch {
      // ignore
    }
  }

  getHeaders() {
    return Array.from(this.table.querySelectorAll<HTMLTableCellElement>('th[mat-header-cell]'));
  }

  getTableWidth() {
    return this.getHeaders()
      .map(el => window.getComputedStyle(el).width)
      .reduce((curr, prev) => {
        return curr + Number.parseFloat(prev);
      }, 0);
  }

  private measureBestWidth(alias: string, th: HTMLTableCellElement): number {
    const selector = `.mat-column-${alias}`;
    const cells = Array.from(this.table.querySelectorAll<HTMLTableCellElement>(`td${selector}`));
    const toMeasure: HTMLElement[] = [th, ...cells];

    const padding = 24;
    const max = toMeasure.reduce((acc, el) => Math.max(acc, el.scrollWidth), 0) + padding;

    const { minWidth, maxWidth } = this.conf;

    return Math.min(Math.max(max, minWidth), maxWidth);
  }
}
