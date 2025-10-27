import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  Input,
  model,
  ModelSignal,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnchorPointEnhancedContextMenuActions } from '../actions/anchorPointEnhancedContextMenuActions';
import { formEnhancedImports } from '../form-imports/formEnhancedImports';
import { TileEnhancedOperations } from './tile-enhanced-operations';
import { FormEnhancedActions } from '../actions/formEnhancedActions';
import { FormEnhancedContextMenuActions } from '../actions/formEnhancedContextMenuActions';
import { AppEntity, CONTROL_TYPE, FormConfig, FormMatrix, Tile } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DATA_SOURCES, GAME_BOARD_FIELD } from '../../../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormHelperService } from '../../helper.service';
import { Store } from '@ngrx/store';
import { FieldConfigActions } from '../../../../store/actions/field-config.actions';

@Component({
  standalone: true,
  templateUrl: './abstract-enhanced-form.component.html',
  styleUrl: './abstract-enhanced-form.component.scss',
  imports: [formEnhancedImports],
})
export abstract class AbstractEnhancedFormComponent<T> implements OnInit {
  store = inject(Store);
  helper = inject(FormHelperService);
  _snackBar = inject(MatSnackBar);
  cd = inject(ChangeDetectorRef);

  colQty = model(GAME_BOARD_FIELD.columns);
  rowQty = model(GAME_BOARD_FIELD.rows);
  elementsPerTile = input<number>(1);
  dragAllowed = input<boolean>(true);

  ignoreTemplate = input<boolean>(false);
  showModeToggler = input<boolean>(true);

  getApPositionStyles = this.helper.getApPositionStyles;
  getTilePositionStyles = this.helper.getTilePositionStyles<T>;
  deserializeFormMatrix = this.helper.deserializeFormMatrix<T>;
  copyMatchingFields = this.helper.copyMatchingFields;
  startDrag = this.helper.startDrag;
  endDrag = this.helper.endDrag;

  protected readonly DATA_SOURCES = DATA_SOURCES;
  CONTROL_TYPE = CONTROL_TYPE;

  tileMargin = 3;
  multiplier = 2;

  draggedTile!: Tile<T>;
  isTileDraggable = true;

  allFields!: ModelSignal<AppEntity<T>[]>;

  public tileOps!: TileEnhancedOperations<T>;

  formGroup: FormGroup = this.fb.group({});

  isFormCtrOn = true;
  protected enableFormStringSuffix = '_state';

  private _formName = 'TEST';

  get formName() {
    return this._formName;
  }

  @Input() set formName(name: string) {
    this._formName = name;
  }

  rowHeight = 85;

  public mtx!: FormMatrix<T>;

  resetFormMtx(colQty: number, rowQty: number) {
    this.colQty.set(colQty);
    this.rowQty.set(rowQty);

    this.buildMtx();

    this.tileOps.mtx = this.mtx;
    this.tileOps.saveFormTemplate();
    this.store.dispatch(FieldConfigActions.setFieldConfig({ columns: colQty, rows: rowQty }));
    this.apCtxMenuActions.dropOnOffField();
  }

  buildMtx() {
    this.mtx = {
      tiles: new Map<number, Tile<T>>(),
      mtx: Array.from({ length: this.rowQty() }, () => Array(this.colQty()).fill(0)),
    };
  }

  fillTiles() {
    this.tileOps.clearAllTiles(
      this.apCtxMenuActions.apFormGroup,
      this.apCtxMenuActions.onOffAlias,
      { showSnackbar: false },
    );
    this.tileOps.fillAllTiles(this.cd, () => {
      this.apCtxMenuActions.setOnOffField(this.allFields().map(_ => _.placeholder));
    });
  }

  formActions!: FormEnhancedActions<T>;

  formCtxMenuActions!: FormEnhancedContextMenuActions<T>;
  apCtxMenuActions!: AnchorPointEnhancedContextMenuActions<T>;

  constructor(
    protected fb: FormBuilder,
    protected localStorageService: LocalStorageService,
  ) {}

  formConfig = computed((): FormConfig => {
    return {
      colQty: this.colQty(),
      rowHeight: this.rowHeight,
      tileMargin: this.tileMargin,
    };
  });

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

    this.setFieldsToMtxTiles(this.allFields());

    this.tileOps = new TileEnhancedOperations<T>(
      this.allFields(),
      this.formName,
      this.mtx,
      this.fb,
      this.localStorageService,
      this._snackBar,
      this.elementsPerTile(),
    );

    this.apCtxMenuActions = new AnchorPointEnhancedContextMenuActions(
      this.fb,
      this.tileOps,
      this._snackBar,
    );
    this.formCtxMenuActions = new FormEnhancedContextMenuActions(this.fb, this.tileOps);

    this.addAllFieldsToFormGroup();
    this.saveFormConstructorState();
  }

  setFieldsToMtxTiles(allFields: AppEntity<T>[]) {
    this.mtx.tiles.forEach(tile => {
      tile.cdkDropListData = tile.cdkDropListData
        .map(source => {
          const target: AppEntity<T> | undefined = allFields.find(f => f.alias === source.alias);

          if (target) {
            this.copyMatchingFields(source, target);

            return target;
          }

          return undefined;
        })
        .filter((item): item is AppEntity<T> => item !== undefined);
    });
    debugger;
  }

  addAllFieldsToFormGroup() {
    this.allFields().forEach(c => {
      c.mainControl && this.tileOps.addControlsToFormGroup(c.alias, c.mainControl, this.formGroup);
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
