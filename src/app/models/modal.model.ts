import { MatDialogRef } from '@angular/material/dialog';

export type ModalDialogRefs = {
  dialogRef: MatDialogRef<any, any>;
  name: string;
  icon: string;
};
