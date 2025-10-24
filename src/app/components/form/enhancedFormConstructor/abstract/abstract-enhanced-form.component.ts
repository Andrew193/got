import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnchorPointEnhancedContextMenuActions } from '../actions/anchorPointEnhancedContextMenuActions';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { TileEnhancedOperations } from './tile-enhanced-operations';
import { FormEnhancedActions } from '../actions/formEnhancedActions';
import { FormEnhancedContextMenuActions } from '../actions/formEnhancedContextMenuActions';
import { Id } from '../../../../models/common.model';
import { AppEntity, CONTROL_TYPE, FormMatrix, Tile } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  templateUrl: './abstract-enhanced-form.component.html',
  styleUrl: './abstract-enhanced-form.component.scss',
  imports: [formEnhancedImports],
})
export abstract class AbstractEnhancedFormComponent<T extends Id> implements OnInit {
  _snackBar = inject(MatSnackBar);

  CONTROL_TYPE = CONTROL_TYPE;

  tileMargin = 3;
  multiplier = 2;

  draggedTile!: Tile<T>;
  isTileDraggable = true;

  allFields!: AppEntity<T>[];

  public tileOps!: TileEnhancedOperations<T>;

  @Input() controllerPath!: string;

  formGroup!: FormGroup;

  isFormCtrOn = true;
  protected enableFormStringSuffix = '_state';

  private _formName = 'TEST';

  get formName(): string {
    return this._formName;
  }

  colQty = 10;
  rowQty = 7;
  rowHeight = 85;

  public mtx: FormMatrix<T> = {
    tiles: new Map<number, Tile<T>>(),
    mtx: Array.from({ length: this.rowQty }, () => Array(this.colQty).fill(0)),
  };

  formActions!: FormEnhancedActions<T>;

  formCtxMenuActions!: FormEnhancedContextMenuActions<T>;
  apCtxMenuActions!: AnchorPointEnhancedContextMenuActions<T>;

  set formName(name: string) {
    this._formName = name;
  }

  constructor(
    protected fb: FormBuilder,
    protected localStorageService: LocalStorageService,
  ) {
    this.formGroup = this.fb.group({});
  }

  private deserializeFormMatrix<T>(parsed: FormMatrix<T>): FormMatrix<T> {
    const tiles = new Map<number, Tile<T>>(parsed.tiles);

    return {
      tiles,
      mtx: parsed.mtx,
    };
  }

  ngOnInit(): void {
    this.formActions = new FormEnhancedActions(this.formGroup);
    const matrixStr = this.localStorageService.getItem(this.formName);

    if (matrixStr) {
      this.mtx = this.deserializeFormMatrix(matrixStr);
    }

    const enableFormStr = this.localStorageService.getItem(
      this.formName + this.enableFormStringSuffix,
    );

    if (enableFormStr) {
      this.isFormCtrOn = JSON.parse(enableFormStr);
    }

    this.mtx.tiles.forEach(tile => {
      tile.cdkDropListData = tile.cdkDropListData
        .map(source => {
          const target: AppEntity<T> | undefined = this.allFields.find(
            f => f.alias === source.alias,
          );

          if (target) {
            this.copyMatchingFields(source, target);

            return target;
          }

          return undefined;
        })
        .filter((item): item is AppEntity<T> => item !== undefined);
    });

    this.tileOps = new TileEnhancedOperations<T>(
      this.allFields,
      this.formName,
      this.mtx,
      this.fb,
      this.localStorageService,
    );
    debugger;
    this.apCtxMenuActions = new AnchorPointEnhancedContextMenuActions(this.fb, this.tileOps);

    this.formCtxMenuActions = new FormEnhancedContextMenuActions(this.fb, this.tileOps);

    this.saveFormConstructorState();
  }

  private copyMatchingFields<T extends Record<string, any>>(source: T, target: T): void {
    const fields: string[] = Object.keys(target).filter(key => typeof target[key] !== 'object');

    fields.forEach(field => {
      const sourceValue = source[field];

      sourceValue && ((target as Record<string, any>)[field] = sourceValue);
    });
  }

  saveFormConstructorState(): void {
    this.tileOps.saveFormTemplate(this.enableFormStringSuffix, JSON.stringify(this.isFormCtrOn));
  }

  setActiveCoordinatesCtxMenu(y: number, x: number) {
    this.apCtxMenuActions.y = y;
    this.apCtxMenuActions.x = x;
  }

  public getTileExistsCondition(): boolean {
    if (this.apCtxMenuActions) {
      return !!this.mtx.mtx[this.apCtxMenuActions.y][this.apCtxMenuActions.x];
    }

    return false;
  }

  public getApPositionStyles(y: number, x: number) {
    return {
      top: `${y * this.rowHeight + 3}px`,
      left: `calc(${this.tileMargin}px + 100% * ${x} / ${this.colQty})`,
      width: `calc(${-this.tileMargin * 2}px + 100% / ${this.colQty})`,
      height: `${this.rowHeight - this.tileMargin * 2}px`,
    };
  }

  public getContainerHeight(rows: number) {
    return (this.rowHeight - this.tileMargin * 2) * rows + 35;
  }

  public getTilePositionStyles(tile: Tile<T>) {
    return {
      ...this.getApPositionStyles(tile.y, tile.x),
      width: `calc(${-this.tileMargin * 2}px + ${tile.xSpan} * 100% / ${this.colQty})`,
      height: `${this.rowHeight * tile.ySpan - this.tileMargin * 2}px`,
    };
  }

  startDrag() {
    document.body.style.userSelect = 'none';
  }

  endDrag() {
    document.body.style.userSelect = 'auto';
  }

  startTileDrag(tile: Tile<T>) {
    document.body.style.userSelect = 'none';
    this.draggedTile = tile;
  }

  onTileDrop(yDrag: number, xDrag: number) {
    const hzOffset = xDrag - this.draggedTile.x;
    const vtOffset = this.draggedTile.y - yDrag;

    this.tileOps.editTile(
      this.draggedTile.y,
      this.draggedTile.x,
      this.draggedTile.ySpan,
      this.draggedTile.xSpan,
      {
        hz: hzOffset,
        vt: vtOffset,
      },
    );
    document.body.style.userSelect = 'auto';
  }

  onTileDragOver(event: DragEvent) {
    event.preventDefault();
  }

  getConnectedTiles(): string[] {
    return [...this.mtx.tiles.keys()].map(key => key.toString());
  }
}
