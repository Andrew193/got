import { MatDialogRef } from '@angular/material/dialog';
import { ModalConfig } from '../components/modal-window/modal-interfaces';

export type ModalDialogRefs = {
  dialogRef: MatDialogRef<any, any>;
  name: string;
  icon: string;
  modalConfig: ModalConfig<unknown>;
};
