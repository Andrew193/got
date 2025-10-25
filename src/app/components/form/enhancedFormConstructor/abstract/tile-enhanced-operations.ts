import { FormBuilder, FormGroup } from '@angular/forms';
import { FormEnhancedOperations } from './form-enhanced-operations';
import { AppEntity, FormMatrix, Tile } from '../form-constructor.models';
import { LocalStorageService } from '../../../../services/localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_CONFIG } from '../../../../constants';

export class TileEnhancedOperations<T> extends FormEnhancedOperations<T> {
  constructor(
    public override allFields: AppEntity<T>[],
    protected override formName: string,
    public override mtx: FormMatrix<T>,
    protected override fb: FormBuilder,
    protected override localStorageService: LocalStorageService,
    protected override _snackBar: MatSnackBar,
    protected elementsPerTile: number,
  ) {
    super(allFields, formName, mtx, fb, localStorageService, _snackBar);
  }

  clearAllTiles(formGroup: FormGroup, alias: string) {
    const formControl = formGroup.get(alias);

    formControl?.setValue([]);
    const matrix = this.mtx.mtx;

    matrix.forEach(row => row.fill(0));
    this.mtx.tiles.clear();
    this.mtx = { ...this.mtx };
    this.saveFormTemplate();
    this._snackBar.open('Form tiles cleared!', '', SNACKBAR_CONFIG);
  }

  private iterateTileSpace(
    y: number,
    x: number,
    ySpan: number,
    xSpan: number,
    callback: (y: number, x: number) => boolean,
  ) {
    let checkColIndex: number;
    let checkRowIndex: number;
    const matrix = this.mtx.mtx;

    if (ySpan <= 0 || xSpan <= 0) {
      return false;
    }

    for (let i = 0; i < ySpan; i++) {
      checkRowIndex = y + i;
      for (let j = 0; j < xSpan; j++) {
        checkColIndex = x + j;
        if (
          checkColIndex >= matrix[0]?.length ||
          0 ||
          checkRowIndex >= matrix.length ||
          !callback(checkRowIndex, checkColIndex)
        )
          return false;
      }
    }

    return true;
  }

  createTile(y: number, x: number, ySpan: number, xSpan: number) {
    const matrix = this.mtx.mtx;
    const tileId: number = Date.now();

    const isAvailable = this.iterateTileSpace(y, x, ySpan, xSpan, (row, col) => !matrix[row][col]);

    if (!isAvailable) {
      this.getFailedToModfyTileError('create');
    } else {
      this.iterateTileSpace(y, x, ySpan, xSpan, (row, col) => {
        matrix[row][col] = tileId;

        return true;
      });

      this.mtx.tiles.set(tileId, {
        id: tileId,
        y: y,
        x: x,
        ySpan: ySpan,
        xSpan: xSpan,
        cdkDropListData: [],
      } as Tile<T>);
      this.mtx = { ...this.mtx };
      this._snackBar.open(`A tile ${xSpan}x${ySpan} succesfully created!`, '', SNACKBAR_CONFIG);
      this.saveFormTemplate();
    }
  }

  private adjustIndex(
    moveOffset: number,
    span: number,
    boundary: number,
    originalIndex: number,
  ): number {
    let indexOffset = originalIndex - moveOffset;

    if (moveOffset > 0 && indexOffset < 0) {
      indexOffset = 0;
    } else if (moveOffset < 0 && indexOffset + span > boundary) {
      indexOffset = boundary - span;
    }

    return indexOffset;
  }

  editTile(
    y: number,
    x: number,
    ySpan?: number,
    xSpan?: number,
    move?: { hz: number; vt: number },
  ) {
    const matrix = this.mtx.mtx;
    const tileId: number = matrix[y][x];
    const tile: Tile<T> | undefined = this.mtx.tiles.get(tileId);
    let yOffset = y;
    let xOffset = x;

    if (tile) {
      ySpan = ySpan || tile.ySpan;
      xSpan = xSpan || tile.xSpan;

      if (move) {
        yOffset = this.adjustIndex(move.vt, ySpan, matrix.length, y);
        xOffset = this.adjustIndex(-move.hz, xSpan, matrix[0].length, x);
      }

      const isAvailable = this.iterateTileSpace(
        yOffset,
        xOffset,
        ySpan,
        xSpan,
        (row, col) => !matrix[row][col] || matrix[row][col] === tileId,
      );

      if (!isAvailable) {
        this.getFailedToModfyTileError('edit');
      } else {
        this.iterateTileSpace(tile.y, tile.x, tile.ySpan, tile.xSpan, (row, col) => {
          matrix[row][col] = 0;

          return true;
        });
        this.iterateTileSpace(yOffset, xOffset, ySpan, xSpan, (row, col) => {
          matrix[row][col] = tileId;

          return true;
        });
        tile.ySpan = ySpan;
        tile.xSpan = xSpan;
        tile.y = yOffset;
        tile.x = xOffset;
        this._snackBar.open(`A tile ${xSpan}x${ySpan} succesfully edited!`, '', SNACKBAR_CONFIG);
        this.saveFormTemplate();
      }
    } else {
      this.getTileAbsentErrorToast(y, x);
    }

    this.mtx = { ...this.mtx };
  }

  duplicateAnchorPointRow(y: number, ySpan: number) {
    const matrix = this.mtx.mtx;

    for (let i = 0; i < ySpan; i++) {
      if (!this.isRowActionAllowed(matrix, y, 'add to')) return;
      matrix.splice(y + 1 + i, 0, [...matrix[y]]);
      this.updateTileRowIndices(y + 1, this.mtx.mtx[y].length, 1);
      this.saveResult('Anchor point row(s) added!');
    }
  }

  deleteAnchorPointRow(y: number, ySpan: number) {
    const matrix = this.mtx.mtx;

    for (let i = 0; i < ySpan; i++) {
      if (!this.isRowActionAllowed(matrix, y, 'delete')) return;
      this.mtx.mtx.splice(y, 1);
      this.updateTileRowIndices(y, this.mtx.mtx[y]?.length || 0, -1);
      this.saveResult('Anchor point row(s) deleted!');
    }
  }

  private saveResult(resultMessage: string) {
    this.mtx = { ...this.mtx };
    this.saveFormTemplate();
    this._snackBar.open(resultMessage, '', SNACKBAR_CONFIG);
  }

  private isRowActionAllowed(matrix: number[][], y: number, action: 'add to' | 'delete'): boolean {
    const currentRow = matrix[y];

    if (action === 'delete' && matrix.length === 1) {
      this._snackBar.open('You can’t delete the last row!', '', SNACKBAR_CONFIG);

      return false;
    }

    if (!currentRow.every(tileId => !tileId)) {
      this._snackBar.open(`You can only ${action} an empty row!`, '', SNACKBAR_CONFIG);

      return false;
    }

    return true;
  }

  private updateTileRowIndices(startIndex: number, rowLength: number, delta: number) {
    const matrix = this.mtx.mtx;
    const tilesToUpdate = new Set<number>();

    for (let i = startIndex; i < matrix.length; i++) {
      for (let j = 0; j < rowLength; j++) {
        const tileId = matrix[i][j];

        if (tileId) tilesToUpdate.add(tileId);
      }
    }

    tilesToUpdate.forEach(tileId => {
      const tile = this.mtx.tiles.get(tileId);

      if (tile) tile.y += delta;
    });
  }

  removeTile(formGroup: FormGroup, alias: string, y: number, x: number) {
    const matrix = this.mtx.mtx;
    const tileId: number = matrix[y][x];
    const tile: Tile<T> | undefined = this.mtx.tiles.get(tileId);

    if (tile) {
      const tileValues = tile.cdkDropListData.map(entity => entity.placeholder);
      const formControl = formGroup.get(alias);
      const restValues = formControl?.value.filter(
        (placeholder: string) => !tileValues.includes(placeholder),
      );

      formControl?.setValue(restValues);
      this.iterateTileSpace(tile.y, tile.x, tile.ySpan, tile.xSpan, (row, col) => {
        matrix[row][col] = 0;

        return true;
      });
      this.mtx.tiles.delete(tileId);
    } else {
      this.getTileAbsentErrorToast(y, x);
    }

    this.mtx = { ...this.mtx };
  }

  private getTileAbsentErrorToast(y: number, x: number) {
    this._snackBar.open(
      `No tile exists on position row = ${y} column = ${x}!`,
      '',
      SNACKBAR_CONFIG,
    );
  }

  private getFailedToModfyTileError(action: string) {
    this._snackBar.open(`Failed to ${action} tile!`, '', SNACKBAR_CONFIG);
  }

  checkFieldsAmount(y: number, x: number) {
    const id = this.mtx.mtx[y][x];
    const tile = this.mtx.tiles.get(id);

    if (tile && this.elementsPerTile) {
      return tile.cdkDropListData.length >= this.elementsPerTile;
    }

    return false;
  }

  moveTileUp(y: number, x: number) {
    const direction = { hz: 0, vt: 1 };

    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileDown(y: number, x: number) {
    const direction = { hz: 0, vt: -1 };

    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileLeft(y: number, x: number) {
    const direction = { hz: -1, vt: 0 };

    this.editTile(y, x, undefined, undefined, direction);
  }

  moveTileRight(y: number, x: number) {
    const direction = { hz: 1, vt: 0 };

    this.editTile(y, x, undefined, undefined, direction);
  }
}
