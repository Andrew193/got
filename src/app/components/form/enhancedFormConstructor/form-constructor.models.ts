import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Id } from '../../../models/common.model';

export interface ProtoAction {
  type: ACTIONS;
  icon: string;
}

export enum ACTIONS {
  EDIT = 'EDIT',
  SAVE = 'SAVE',
  CANCEL = 'CANCEL',
  REMOVE = 'REMOVE',
  UNBIND = 'UNBIND',
  BIND = 'BIND',
  STATE = 'STATE',
  COLOR = 'COLOR',
  LABEL = 'LABEL',
  CREATE = 'CREATE',
  CLEAR = 'CLEAR',
  DUPLICATE = 'DUPLICATE',
  DELETE = 'DELETE',
}

export enum CONTROL_TYPE {
  SELECT,
  INPUT,
  BOOLEAN,
  DATE_RANGE,
  DATE_INPUT,
  TEXT,
}

export type DefinedConfigs = {
  colQty: number;
  rowQty: number;
} & Id;

export type FormConfig = {
  rowHeight: number;
  tileMargin: number;
  colQty: number;
};

export interface Control {
  type: CONTROL_TYPE;
  getControl: () => AbstractControl;
  dependentAliases?: string[];
  filterLocalSource?: (field?: string, term?: string, dep?: string) => Observable<string[]>;
}

export interface AppEntity<T> {
  cell?: (model: T) => any;
  alias: string;
  placeholder: string;
  mainControl?: Control;
  rowControl?: Control;
  action?: (alias: string, formGroup: FormGroup) => void;
}

export interface Tile<T> {
  id: number;
  y: number;
  x: number;
  ySpan: number;
  xSpan: number;
  cdkDropListData: AppEntity<T>[];
}

export interface FormMatrix<T> {
  tiles: Map<number, Tile<T>>;
  mtx: number[][];
}
