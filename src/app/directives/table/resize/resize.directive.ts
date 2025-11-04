import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
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

export type ResizeCfg = {
  storageKey?: string;
  minWidth?: number;
  maxWidth?: number;
  handleWidth?: number;
  autosave?: boolean;
  preserveTableWidth?: boolean;
  staticTable?: boolean;
};

@Directive({
  selector: '[appTableResize]',
})
export class TableResizeDirective<T> implements AfterViewInit, OnDestroy {
  resizeActive = input(true);
  columns = input<TableColumns<T>[]>([]);
  tableName = input('');
  equalize = input<number | null>(null);
  localStorageService = inject(LocalStorageService);

  inited = false;
  private colgroup?: HTMLTableColElement[];

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
      storageKey: c.storageKey || this.inferStorageKey(),
      minWidth: c.minWidth || 100,
      maxWidth: c.maxWidth || 1200,
      handleWidth: c.handleWidth || 10,
      autosave: c.autosave ?? true,
      preserveTableWidth: c.preserveTableWidth ?? true,
      staticTable: c.staticTable ?? true,
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
          this.resetResize();
        }

        this.inited = true;
      });
    });

    effect(() => {
      if (this.equalize()) {
        this.resetResize();
        this.saveWidth();
        this.resizeStoped.emit(new Date().getTime());
      }
    });
  }

  resetResize() {
    this.reinstallHandles();
    this.colgroup = undefined;
    this.table.querySelector('colgroup')?.remove();
    this.ensureColgroup();
    const sbw = this.getBarWidth();

    this.freezeCurrentWidths(
      true,
      (this.table.parentElement?.offsetWidth || sbw) - sbw - this.conf.handleWidth,
    );
  }

  private ensureColgroup() {
    if (this.colgroup?.length) return;

    const table = this.table;
    let cg = table.querySelector('colgroup') as HTMLTableSectionElement | null;

    if (!cg) {
      cg = this.r.createElement('colgroup') as HTMLTableSectionElement;
      table.insertBefore(cg, table.firstElementChild);
    }

    const headers = this.getHeaders();

    this.colgroup = headers.map(h => {
      const alias = this.pickAlias(h)!;
      let col = cg!.querySelector(`col.mat-column-${alias}`) as HTMLTableColElement | null;

      if (!col) {
        col = this.r.createElement('col') as HTMLTableColElement;
        this.r.addClass(col, `mat-column-${alias}`);
        cg!.appendChild(col);
      }

      return col!;
    });
  }

  ngAfterViewInit() {
    const resizeActive = this.resizeActive();

    this.table = this.el.nativeElement as HTMLTableElement;
    this.r.setStyle(this.table, 'table-layout', 'fixed');

    this.freezeCurrentWidths();

    if (resizeActive) {
      this.installHandles();

      this.zone.runOutsideAngular(() => {
        const up = this.r.listen(this.doc, 'mouseup', () => this.stopResizing());
        const move = this.r.listen(this.doc, 'mousemove', (e: MouseEvent) => this.onMouseMove(e));
        const dbl = this.r.listen(this.doc, 'dblclick', (e: MouseEvent) => this.onDblClick(e));

        this.destroyFns.push(up, move, dbl);
      });
    }
  }

  ngOnDestroy() {
    this.destroyFns.forEach(f => f());
  }

  private freezeCurrentWidths(hardReset = false, width?: number) {
    const headers = this.getHeaders();
    const anyInline = headers.some(h => h.style.width);

    if (anyInline && !hardReset) return;

    let tableWidth = width || this.getTableWidth();
    const raw = hardReset ? null : this.localStorageService.getItem(this.conf.storageKey);

    if (raw) {
      const toRemove = Object.values(raw as Record<string, number>).reduce((curr, prev) => {
        return curr + prev;
      }, 0);

      tableWidth -= toRemove;
    }

    headers.forEach(h => {
      const alias = this.pickAlias(h);
      const noStylesCount = headers.length - (raw ? Object.values(raw).length || 0 : 0);

      const w =
        alias && raw && raw[alias]
          ? raw[alias]
          : noStylesCount > 0
            ? tableWidth / noStylesCount
            : h.getBoundingClientRect().width || h.offsetWidth;

      this.applyWidth(h, Math.round(w));
    });
  }

  private installHandles() {
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

  private reinstallHandles() {
    const handles = this.table.querySelectorAll('.col-resize-handle');

    handles.forEach(h => h.remove());
    this.installHandles();
  }

  private onMouseDown(e: MouseEvent, th: HTMLTableCellElement) {
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

  private onMouseMove(e: MouseEvent) {
    if (!this.moving) return;

    const dx = e.clientX - this.moving.startX;
    let next = this.moving.startW + dx;
    const { minWidth, maxWidth, preserveTableWidth, staticTable } = this.conf;

    // Clip the desired width of the current column
    next = this.clamp(next, minWidth, maxWidth);

    if (!preserveTableWidth) {
      // Without compensation (can be problematic for small tables)
      this.applyWidth(this.moving.th, next);
      this.columnWidthChange.emit({ alias: this.moving.alias, width: next });

      return;
    }

    // Maintain the sum: decrease/increase the width of the adjacent column
    const rightNeighbor = this.pickRightNeighbor(this.moving.th);
    const leftNeighbor = this.pickLeftNeighbor(this.moving.th);

    const neighborTh = rightNeighbor ?? leftNeighbor;

    if (!neighborTh) {
      // If there is no neighbor, let the overall width change
      this.applyWidth(this.moving.th, next);
      this.columnWidthChange.emit({ alias: this.moving.alias, width: next });

      return;
    }

    const currA = this.moving.th.getBoundingClientRect().width;
    const delta = next - currA; // By how much do we want to change A (target)

    if (delta === 0 && staticTable) return;

    const aliasB = this.pickAlias(neighborTh);

    if (!aliasB) return;

    const currB = neighborTh.getBoundingClientRect().width;
    let nextB = currB - delta; // Compensate

    // Choose min/max for B
    nextB = this.clamp(nextB, minWidth, maxWidth);

    // If we hit the limit on B, we'll recalculate how much remains to be compensated
    const effectiveDelta = currB - nextB; // How much was actually taken from B

    //Increase table width (if there is a config)
    const effectiveA = this.getEffectiveA(delta, effectiveDelta, currA);
    const effectiveB = this.getEffectiveB(nextB, effectiveDelta, currB, effectiveA, dx);

    const A = this.clamp(effectiveA, minWidth, maxWidth);
    const B = this.clamp(effectiveB, minWidth, maxWidth);

    const finalA = staticTable ? A : B === maxWidth ? A + Math.abs(dx) : A;
    const finalB = staticTable ? B : B === maxWidth ? B + dx : B;

    // Optional drop for small size
    // if (finalA === minWidth) {
    //   //Silent drop of resizing
    //   this.stopResizing();
    //
    //   return;
    // }

    this.applyWidth(this.moving.th, finalA);
    this.applyWidth(neighborTh, finalB);

    this.columnWidthChange.emit({ alias: this.moving.alias, width: finalA });
    this.columnWidthChange.emit({ alias: aliasB, width: finalB });
  }

  private getEffectiveA(delta: number, effectiveDelta: number, currA: number) {
    const { staticTable } = this.conf;

    if (staticTable) {
      return currA + effectiveDelta;
    }

    return delta > 0 && effectiveDelta === 0 ? currA + delta : currA + effectiveDelta;
  }

  private getEffectiveB(
    nextB: number,
    effectiveDelta: number,
    currB: number,
    effectiveA: number,
    dx: number,
  ) {
    const { minWidth, staticTable } = this.conf;

    if (staticTable) {
      return nextB;
    }

    return effectiveDelta === 0 && effectiveA === minWidth ? currB + dx : nextB;
  }

  private pickRightNeighbor(th: HTMLTableCellElement): HTMLTableCellElement | null {
    const all = this.getHeaders();
    const idx = all.indexOf(th);

    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  }

  private pickLeftNeighbor(th: HTMLTableCellElement): HTMLTableCellElement | null {
    const all = this.getHeaders();
    const idx = all.indexOf(th);

    return idx > 0 ? all[idx - 1] : null;
  }

  private stopResizing() {
    if (!this.moving) return;

    if (this.conf.autosave) this.saveWidth();

    this.doc.body.classList.remove('resizing-col');
    this.moving = undefined;
    this.resizeStoped.emit(new Date().getTime());
  }

  private onDblClick(e: MouseEvent) {
    const { staticTable } = this.conf;

    if (!staticTable) {
      //Slight table width increase (increases table width by adding overflow)
      const target = e.target as HTMLElement;

      if (!target.closest('.col-resize-handle')) return;

      const th = target.closest('th[mat-header-cell]') as HTMLTableCellElement | null;

      if (!th) return;
      const alias = this.pickAlias(th);

      if (!alias) return;

      const best = this.measureBestWidth(alias, th);

      this.applyWidth(th, best);
      this.columnWidthChange.emit({ alias, width: best });
      if (this.conf.autosave) this.saveWidth();
    }
  }

  private pickAlias(th: HTMLTableCellElement): string | null {
    const cls = Array.from(th.classList).find(c => c.startsWith('mat-column-'));

    return cls ? cls.replace('mat-column-', '') : null;
  }

  private applyWidth(th: HTMLTableCellElement, widthPx: number) {
    const alias = this.pickAlias(th);

    if (!alias) return;

    // If there is a colgroup, set the width to <col>
    this.ensureColgroup();
    const col = this.table.querySelector(`col.mat-column-${alias}`) as HTMLTableColElement | null;

    if (col) {
      this.r.setStyle(col, 'width', `${widthPx}px`);
      this.r.setStyle(col, 'minWidth', `${widthPx}px`);
      this.r.setStyle(col, 'maxWidth', `${widthPx}px`);
    }

    // Mirror to th/td for compatibility with custom styles
    this.r.setStyle(th, 'width', `${widthPx}px`);
    this.r.setStyle(th, 'minWidth', `${widthPx}px`);
    this.r.setStyle(th, 'maxWidth', `${widthPx}px`);

    // TD setter (not mandatory)
    // const selector = `.mat-column-${alias}`;
    // const cells = this.table.querySelectorAll<HTMLTableCellElement>(`td${selector}`);
    // cells.forEach(td => {
    //   this.r.setStyle(td, 'width', `${widthPx}px`);
    //   this.r.setStyle(td, 'minWidth', `${widthPx}px`);
    //   this.r.setStyle(td, 'maxWidth', `${widthPx}px`);
    // });
  }

  private inferStorageKey(): string {
    const id = this.table?.id || '';
    const path = location?.pathname || '';

    return this.tableName() || `table-resize:${path}:${id || 'default'}`;
  }

  private saveWidth() {
    try {
      const toSave = this.getHeaderWidthMap();
      const key = this.conf.storageKey;

      this.localStorageService.setItem(key, toSave);
    } catch {
      // ignore
    }
  }

  getHeaderWidthMap() {
    return this.getHeaders().reduce(
      (prev, curr) => {
        return { ...prev, [this.pickAlias(curr) || '']: curr.clientWidth };
      },
      {} as Record<string, number>,
    );
  }

  getHeaders() {
    return Array.from(this.table.querySelectorAll<HTMLTableCellElement>('th[mat-header-cell]'));
  }

  getTableWidth() {
    return this.getHeaders()
      .map(el => window.getComputedStyle(el).width)
      .reduce((curr, prev) => curr + Number.parseFloat(prev), -this.getBarWidth());
  }

  private measureBestWidth(alias: string, th: HTMLTableCellElement): number {
    const selector = `.mat-column-${alias}`;
    const cells = Array.from(this.table.querySelectorAll<HTMLTableCellElement>(`td${selector}`));
    const toMeasure: HTMLElement[] = [th, ...cells];

    const padding = 24;
    const max = toMeasure.reduce((acc, el) => Math.max(acc, el.scrollWidth), 0) + padding;

    const { minWidth, maxWidth } = this.conf;

    return this.clamp(max, minWidth, maxWidth);
  }

  private clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }

  private getBarWidth() {
    return (
      (this.table.parentElement?.offsetWidth || 0) - (this.table.parentElement?.clientWidth || 0)
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.freezeCurrentWidths(true);
  }
}
