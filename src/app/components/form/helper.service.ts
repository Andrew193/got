import { Injectable } from '@angular/core';
import {
  DefinedConfigs,
  FormConfig,
  FormMatrix,
  Tile,
} from './enhancedFormConstructor/form-constructor.models';

@Injectable({
  providedIn: 'root',
})
export class FormHelperService {
  configArray: DefinedConfigs[] = [
    { rowQty: 4, colQty: 3, id: crypto.randomUUID() },
    { rowQty: 5, colQty: 5, id: crypto.randomUUID() },
    { rowQty: 7, colQty: 10, id: crypto.randomUUID() },
  ];

  getApPositionStyles(y: number, x: number, config: FormConfig) {
    return {
      top: `${y * config.rowHeight + 3}px`,
      left: `calc(${config.tileMargin}px + 100% * ${x} / ${config.colQty})`,
      width: `calc(${-config.tileMargin * 2}px + 100% / ${config.colQty})`,
      height: `${config.rowHeight - config.tileMargin * 2}px`,
    };
  }

  getTilePositionStyles<T>(tile: Tile<T>, config: FormConfig) {
    return {
      ...this.getApPositionStyles(tile.y, tile.x, config),
      width: `calc(${-config.tileMargin * 2}px + ${tile.xSpan} * 100% / ${config.colQty})`,
      height: `${config.rowHeight * tile.ySpan - config.tileMargin * 2}px`,
    };
  }

  deserializeFormMatrix<T>(parsed: FormMatrix<T>): FormMatrix<T> {
    const tiles = new Map<number, Tile<T>>(parsed.tiles);

    return {
      tiles,
      mtx: parsed.mtx,
    };
  }

  copyMatchingFields<T extends Record<string, any>>(source: T, target: T): void {
    const fields: string[] = Object.keys(target).filter(key => typeof target[key] !== 'object');

    fields.forEach(field => {
      const sourceValue = source[field];

      sourceValue && ((target as Record<string, any>)[field] = sourceValue);
    });
  }

  startDrag() {
    document.body.style.userSelect = 'none';
  }

  endDrag() {
    document.body.style.userSelect = 'auto';
  }
}
