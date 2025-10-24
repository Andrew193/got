import { FormBuilder, FormGroup } from '@angular/forms';
import { TileEnhancedOperations } from '../abstract/tile-enhanced-operations';
import { AppEntity } from '../form-constructor.models';
import { Id } from '../../../../models/common.model';
import { ProtoActions } from './protoActions';
import { AppAction } from './appAction';

export class FormEnhancedContextMenuActions<T extends Id> extends ProtoActions {
  currentFormElementForCtxMenu!: AppEntity<T>;

  override allActions: AppAction<AppEntity<T>>[] = [];

  formCtxMenuFormGroup!: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected tileOps: TileEnhancedOperations<T>,
  ) {
    super();
    this.formCtxMenuFormGroup = this.fb.group({});
    this.allActions
      .map(a => a.appEntity)
      .forEach(
        c =>
          !!c && tileOps.addControlsToFormGroup(c.alias, c.mainControl, this.formCtxMenuFormGroup),
      );
  }
}
