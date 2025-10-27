import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Id } from '../../../models/common.model';
import { Coordinate } from '../../../models/field.model';
import { Signal } from '@angular/core';

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

export enum ModifyTileError {
  create = ACTIONS.CREATE,
  edit = ACTIONS.EDIT,
}

export enum CONTROL_TYPE {
  SELECT,
  INPUT,
  BOOLEAN,
  DATE_RANGE,
  DATE_INPUT,
  TEXT,
  CUSTOM,
}

export enum CONTROL_DATA_TYPE {
  HERO_PREVIEW = 1,
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
  data?: CONTROL_DATA_TYPE;
  dataContext?: any;
  dependentAliases?: string[];
  filterLocalSource?: (field?: string, term?: string, dep?: string) => Observable<string[]>;
}

export interface ControlCustomComponent {
  data: any;
  coordinate: Signal<Coordinate>;
}

export interface AppEntity<T> {
  cell?: (model: T) => any;
  alias: string;
  placeholder: string;
  mainControl?: Control;
  action?: (alias: string, formGroup: FormGroup) => void;
}

export interface Tile<T> extends Coordinate {
  id: number;
  ySpan: number;
  xSpan: number;
  cdkDropListData: AppEntity<T>[];
}

export interface FormMatrix<T> {
  tiles: Map<number, Tile<T>>;
  mtx: number[][];
}

type ShowSnackbar = {
  showSnackbar: boolean;
};

export type TileCreationConfig<T> = {
  cdkDropListData: AppEntity<T>[];
  tileId: number;
  saveTemplate: boolean;
} & ShowSnackbar;

export type TilesClearConfig = {} & ShowSnackbar;
