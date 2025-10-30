import { Tile } from '../../components/form/enhancedFormConstructor/form-constructor.models';
import { TileEnhancedOperations } from '../../components/form/enhancedFormConstructor/abstract/tile-enhanced-operations';
import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

type ResizeConfig<T> = {
  enabled: boolean;
  y: number;
  x: number;
  tile: Tile<T>;
  tileOps: TileEnhancedOperations<T>;
  cellW?: number;
  cellH?: number;
};

@Directive({
  selector: '[appTileResize]',
})
export class TileResizeDirective<T> implements OnInit, OnDestroy {
  @Input('appTileResize') cfg!: ResizeConfig<T>;

  private handleEl!: HTMLElement;
  private destroyFns: (() => void)[] = [];
  private startX = 0;
  private startY = 0;
  private startW = 0;
  private startH = 0;
  private baseCellW = 0;
  private baseCellH = 0;
  private resizing = false;

  constructor(
    private host: ElementRef<HTMLElement>,
    private r: Renderer2,
  ) {}

  ngOnInit(): void {
    const style = getComputedStyle(this.host.nativeElement);

    if (style.position === 'static') {
      this.r.setStyle(this.host.nativeElement, 'position', 'relative');
    }

    this.handleEl = this.r.createElement('div');
    this.r.addClass(this.handleEl, 'tile-resize-handle');
    this.r.setStyle(this.handleEl, 'position', 'absolute');
    this.r.setStyle(this.handleEl, 'right', '0');
    this.r.setStyle(this.handleEl, 'bottom', '0');
    this.r.setStyle(this.handleEl, 'width', '12px');
    this.r.setStyle(this.handleEl, 'height', '12px');
    this.r.setStyle(this.handleEl, 'cursor', 'nwse-resize');
    this.r.setStyle(this.handleEl, 'user-select', 'none');
    this.r.setStyle(this.handleEl, 'touch-action', 'none');
    this.r.setStyle(this.handleEl, 'opacity', this.cfg.enabled ? '0.7' : '0');
    this.r.appendChild(this.host.nativeElement, this.handleEl);

    const down = this.r.listen(this.handleEl, 'pointerdown', (e: PointerEvent) => {
      if (!this.cfg?.enabled) return;
      e.preventDefault();
      e.stopPropagation();

      (e.target as Element).setPointerCapture?.(e.pointerId);

      const rect = this.host.nativeElement.getBoundingClientRect();

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startW = rect.width;
      this.startH = rect.height;

      this.baseCellW = this.cfg.cellW ?? this.startW / Math.max(1, this.cfg.tile.xSpan);
      this.baseCellH = this.cfg.cellH ?? this.startH / Math.max(1, this.cfg.tile.ySpan);

      this.resizing = true;
      this.toggleUserSelect(true);
    });

    const move = this.r.listen('window', 'pointermove', (e: PointerEvent) => {
      if (!this.resizing) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      const nextW = Math.max(1, this.startW + dx);
      const nextH = Math.max(1, this.startH + dy);

      const rawXSpan = Math.max(1, Math.round(nextW / this.baseCellW));
      const rawYSpan = Math.max(1, Math.round(nextH / this.baseCellH));

      this.r.setStyle(this.host.nativeElement, 'width', `${rawXSpan * this.baseCellW}px`);
      this.r.setStyle(this.host.nativeElement, 'height', `${rawYSpan * this.baseCellH}px`);
    });

    const up = this.r.listen('window', 'pointerup', (e: PointerEvent) => {
      if (!this.resizing) return;
      this.resizing = false;
      this.toggleUserSelect(false);

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      const finalW = Math.max(1, this.startW + dx);
      const finalH = Math.max(1, this.startH + dy);

      const newXSpan = Math.max(1, Math.round(finalW / this.baseCellW));
      const newYSpan = Math.max(1, Math.round(finalH / this.baseCellH));

      try {
        this.cfg.tileOps.editTile(this.cfg.y, this.cfg.x, newYSpan, newXSpan, { hz: 0, vt: 0 });
      } catch (tileError) {
        const tile = tileError as Tile<T>;

        this.r.setStyle(this.host.nativeElement, 'width', `${tile.xSpan * this.baseCellW}px`);
        this.r.setStyle(this.host.nativeElement, 'height', `${tile.ySpan * this.baseCellH}px`);
      }
    });

    this.destroyFns.push(down, move, up);
  }

  ngOnDestroy(): void {
    this.destroyFns.forEach(fn => fn());
    this.destroyFns = [];
  }

  @Input()
  set appTileResizeEnabled(v: boolean) {
    if (this.handleEl) {
      this.r.setStyle(this.handleEl, 'opacity', v ? '0.7' : '0');
    }
  }

  private toggleUserSelect(on: boolean) {
    const v = on ? 'none' : '';

    this.r.setStyle(document.body, 'user-select', v);
    this.r.setStyle(document.body, 'cursor', on ? 'nwse-resize' : '');
  }
}
