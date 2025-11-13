import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TileEnhancedOperations } from '../abstract/tile-enhanced-operations';
import { ACTIONS, AppEntity, CONTROL_TYPE, Tile } from '../form-constructor.models';
import { ProtoActions } from './protoActions';
import { AnchorPointAction } from './anchorPointAction';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_CONFIG } from '../../../../constants';

export class AnchorPointEnhancedContextMenuActions<T> extends ProtoActions {
  public y = 0;
  public x = 0;
  disabled = true;

  tileColSpanAlias = 'tile-col-span';
  tileRowSpanAlias = 'tile-row-span';
  onOffAlias = 'formFieldsOnOff';

  apFormGroup!: FormGroup;

  apFields!: AppEntity<T>[];

  onOffField: AppEntity<T>;

  override allActions: AnchorPointAction[] = [
    {
      type: ACTIONS.CREATE,
      icon: 'add_circle_outline',
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      getAction: () => {
        const spans = this.getSpans();

        this.tileOps.createTile(this.y, this.x, spans.ySpan, spans.xSpan);
      },
      getDescription: () => 'Add new tile',
      color: 'green',
    },
    {
      type: ACTIONS.EDIT,
      getShowCondition: () => !!this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'edit_note',
      getAction: () => {
        const spans = this.getSpans();

        this.tileOps.editTile(this.y, this.x, spans.ySpan, spans.xSpan);
      },
      getDescription: () => 'Edit tile',
      color: 'red',
    },
    {
      type: ACTIONS.REMOVE,
      getShowCondition: () => !!this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'remove_circle_outline',
      getAction: () => {
        this.tileOps.removeTile(this.apFormGroup, this.onOffAlias, this.y, this.x);
      },
      getDescription: () => 'Remove tile',
      color: 'red',
    },
    {
      type: ACTIONS.DUPLICATE,
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'control_point_duplicate',
      getAction: () => {
        this.tileOps.duplicateAnchorPointRow(this.y, this.getSpans().ySpan);
      },
      getDescription: () => {
        return `Add ${this.getSpans().ySpan} row(s) here`;
      },
      color: 'green',
    },
    {
      type: ACTIONS.DELETE,
      getShowCondition: () => !this.tileOps.mtx.mtx[this.y][this.x],
      icon: 'highlight_remove',
      getAction: () => {
        this.tileOps.deleteAnchorPointRow(this.y, this.getSpans().ySpan);
        this.y = 0;
      },
      getDescription: () => {
        return `Delete ${this.getSpans().ySpan} row(s) here`;
      },
      color: 'red',
    },
  ];

  constructor(
    protected fb: FormBuilder,
    protected tileOps: TileEnhancedOperations<T>,
    protected _snackBar: MatSnackBar,
  ) {
    super();
    const activeFormElements = [...this.tileOps.mtx.tiles.values()]
      .map(el => el.cdkDropListData.map(tile => tile.placeholder || ''))
      .flat()
      .filter(a => this.tileOps.allFields.find(f => f.placeholder === a));

    this.onOffField = {
      alias: this.onOffAlias,
      placeholder: 'Form fields on/off',
      mainControl: {
        type: CONTROL_TYPE.SELECT,
        getControl: () => new FormControl<string[]>(activeFormElements),
        filterLocalSource: this.tileOps.getSortedActiveFormElements,
      },
      action: this.enableDisableFormElements,
    };
    this.apFields = [
      {
        alias: this.tileColSpanAlias,
        placeholder: 'Col span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(1),
        },
      },
      {
        alias: this.tileRowSpanAlias,
        placeholder: 'Row span',
        mainControl: {
          type: CONTROL_TYPE.INPUT,
          getControl: () => new FormControl<number>(1),
        },
      },
    ];
    this.apFields.push(this.onOffField);

    this.apFormGroup = this.fb.group({});
    this.apFields.forEach(c =>
      this.tileOps.addControlsToFormGroup(c.alias, c.mainControl, this.apFormGroup),
    );
  }

  dropOnOffField() {
    this.setOnOffField([]);
  }

  setOnOffField(value: string[]) {
    const OnOffField = this.apFormGroup.get(this.onOffAlias);

    if (OnOffField) {
      OnOffField.setValue(value);
    }
  }

  public enableDisableFormElements = (alias: string, formGroup: FormGroup) => {
    const formControl = formGroup.get(alias);
    const matrix = this.tileOps.mtx;

    if (matrix.tiles.size) {
      if (formControl) {
        const activePlaceHolders = formControl.value;
        const activeFormElements = [...matrix.tiles.values()]
          .map(el => el.cdkDropListData.map(tile => tile.placeholder || ''))
          .flat();

        this.enableFormElements(activePlaceHolders, activeFormElements);
        this.disableFormElement(activePlaceHolders, activeFormElements);

        this._snackBar.open('Form configuration successfully changed!', '', SNACKBAR_CONFIG);
      }
    } else {
      formControl?.reset();
      this._snackBar.open(
        'No form containers found! Please add at least one form container!',
        '',
        SNACKBAR_CONFIG,
      );
    }

    this.tileOps.saveFormTemplate();
  };

  private enableFormElements(activePlaceHolders: string[], activeFormElements: string[]): void {
    const matrix = this.tileOps.mtx;

    if (matrix.tiles.size) {
      const addedPlaceHolders = activePlaceHolders.filter(
        item => !activeFormElements.includes(item),
      );

      addedPlaceHolders.forEach((placeholder: string) => {
        const tileId: number = matrix.mtx[this.y][this.x];

        if (tileId) {
          const appForm = this.tileOps.allFields.find(a => a.placeholder === placeholder);
          const tile: Tile<T> | undefined = matrix.tiles.get(tileId);

          appForm && tile?.cdkDropListData.push(appForm);
        }
      });
    }
  }

  private getSpans(): { ySpan: number; xSpan: number } {
    const tileRowSpan: number = this.apFormGroup.get(this.tileRowSpanAlias)?.value;
    const tileColSpan: number = this.apFormGroup.get(this.tileColSpanAlias)?.value;

    return { ySpan: Number(tileRowSpan), xSpan: Number(tileColSpan) };
  }

  private disableFormElement(activePlaceHolders: string[], activeFormElements: string[]): void {
    const matrix = this.tileOps.mtx;

    if (matrix.tiles.size) {
      const removedPlaceHolders = activeFormElements.filter(
        item => !activePlaceHolders.includes(item),
      );

      removedPlaceHolders.forEach(placeHolder => {
        matrix.tiles.forEach(t => {
          t.cdkDropListData = t.cdkDropListData.filter(obj => obj.placeholder !== placeHolder);
        });
      });
    }
  }
}
