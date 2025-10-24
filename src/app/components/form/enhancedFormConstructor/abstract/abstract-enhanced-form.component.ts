import { Component, computed, inject, input, Input, model, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnchorPointEnhancedContextMenuActions } from '../actions/anchorPointEnhancedContextMenuActions';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { TileEnhancedOperations } from './tile-enhanced-operations';
import { FormEnhancedActions } from '../actions/formEnhancedActions';
import { FormEnhancedContextMenuActions } from '../actions/formEnhancedContextMenuActions';
import { Id } from '../../../../models/common.model';
import { AppEntity, CONTROL_TYPE, FormConfig, FormMatrix, Tile } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DATA_SOURCES } from '../../../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormHelperService } from '../../helper.service';

@Component({
  standalone: true,
  templateUrl: './abstract-enhanced-form.component.html',
  styleUrl: './abstract-enhanced-form.component.scss',
  imports: [formEnhancedImports],
})
export abstract class AbstractEnhancedFormComponent<T extends Id> implements OnInit {
  helper = inject(FormHelperService);

  _snackBar = inject(MatSnackBar);
  colQty = model(10);
  rowQty = model(7);
  ignoreTemplate = input<boolean>(false);

  protected readonly DATA_SOURCES = DATA_SOURCES;
  showModeToggler = input<boolean>(true);

  CONTROL_TYPE = CONTROL_TYPE;

  tileMargin = 3;
  multiplier = 2;

  draggedTile!: Tile<T>;
  isTileDraggable = true;

  allFields!: AppEntity<T>[];

  public tileOps!: TileEnhancedOperations<T>;

  formGroup: FormGroup = this.fb.group({});

  isFormCtrOn = true;
  protected enableFormStringSuffix = '_state';

  private _formName = 'TEST';

  get formName(): string {
    return this._formName;
  }

  rowHeight = 85;

  public mtx!: FormMatrix<T>;

  resetFormMtx(colQty: number, rowQty: number) {
    this.colQty.set(colQty);
    this.rowQty.set(rowQty);
    this.buildMtx();
    this.tileOps.mtx = this.mtx;
    this.tileOps.saveFormTemplate();
  }

  buildMtx() {
    this.mtx = {
      tiles: new Map<number, Tile<T>>(),
      mtx: Array.from({ length: this.rowQty() }, () => Array(this.colQty()).fill(0)),
    };
  }

  formActions!: FormEnhancedActions<T>;

  formCtxMenuActions!: FormEnhancedContextMenuActions<T>;
  apCtxMenuActions!: AnchorPointEnhancedContextMenuActions<T>;

  @Input() set formName(name: string) {
    this._formName = name;
  }

  constructor(
    protected fb: FormBuilder,
    protected localStorageService: LocalStorageService,
  ) {}

  private deserializeFormMatrix<T>(parsed: FormMatrix<T>): FormMatrix<T> {
    const tiles = new Map<number, Tile<T>>(parsed.tiles);

    return {
      tiles,
      mtx: parsed.mtx,
    };
  }

  formConfig = computed((): FormConfig => {
    return {
      colQty: this.colQty(),
      rowHeight: this.rowHeight,
      tileMargin: this.tileMargin,
    };
  });

  getApPositionStyles = this.helper.getApPositionStyles;
  getTilePositionStyles = this.helper.getTilePositionStyles<T>;
  configArray = this.helper.configArray;

  ngOnInit(): void {
    this.buildMtx();
    this.formActions = new FormEnhancedActions(this.formGroup, this._snackBar);
    const matrixStr = this.localStorageService.getItem(this.formName);

    if (matrixStr && !this.ignoreTemplate()) {
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
      this._snackBar,
    );

    this.apCtxMenuActions = new AnchorPointEnhancedContextMenuActions(
      this.fb,
      this.tileOps,
      this._snackBar,
    );
    this.formCtxMenuActions = new FormEnhancedContextMenuActions(this.fb, this.tileOps);

    this.allFields.forEach(c => {
      c.mainControl && this.tileOps.addControlsToFormGroup(c.alias, c.mainControl, this.formGroup);
    });

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

  toggleFormConstructor(event: MatSlideToggleChange) {
    this.isFormCtrOn = event.checked;
    this.saveFormConstructorState();
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

  startDrag() {
    document.body.style.userSelect = 'none';
  }

  endDrag() {
    document.body.style.userSelect = 'auto';
  }

  startTileDrag(tile: Tile<T>) {
    this.startDrag();
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
    this.endDrag();
  }

  onTileDragOver(event: DragEvent) {
    event.preventDefault();
  }

  getConnectedTiles(): string[] {
    return [...this.mtx.tiles.keys()].map(key => key.toString());
  }
}
