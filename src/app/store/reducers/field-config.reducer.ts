import { GAME_BOARD_FIELD } from '../../constants';
import { createReducer, on } from '@ngrx/store';
import { FieldConfigActions } from '../actions/field-config.actions';
import { FieldConfig } from '../store.interfaces';

export const FieldConfigInitialState: FieldConfig = {
  rows: GAME_BOARD_FIELD.rows,
  columns: GAME_BOARD_FIELD.columns,
};

export const FieldConfigReducer = createReducer(
  FieldConfigInitialState,
  on(FieldConfigActions.setFieldConfig, (state, action) => {
    return { ...state, rows: action.rows, columns: action.columns };
  }),
);
