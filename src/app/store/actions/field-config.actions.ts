import { createActionGroup, props } from '@ngrx/store';

export const FieldConfigActions = createActionGroup({
  source: 'FieldConfig',
  events: {
    setFieldConfig: props<{ rows: number; columns: number }>(),
  },
});
