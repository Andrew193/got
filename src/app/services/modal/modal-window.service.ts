import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig } from '../../components/modal-window/modal-interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDialogRefs } from '../../models/modal.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  static frozen = false;
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  dialogRefs = new Map<string, ModalDialogRefs>();
  selectedDialogRef: number | null = null;

  private _modalConfig: BehaviorSubject<ModalConfig | null> =
    new BehaviorSubject<ModalConfig | null>(null);
  modalConfig$ = this._modalConfig.asObservable();

  openModal(modalConfig: ModalConfig) {
    if (!ModalWindowService.frozen) {
      const dialogId = crypto.randomUUID();

      setTimeout(() => {
        this._modalConfig.next({ ...modalConfig, dialogId });
      });

      return dialogId;
    }

    return '';
  }

  dropModal() {
    this._modalConfig.next(null);
  }

  isModalTabSelected = (i: null | number) => {
    return this.selectedDialogRef === i;
  };

  private getOverlayPane(ref: MatDialogRef<unknown>): HTMLElement | null {
    const overlayRef = (ref as any)._ref.overlayRef;

    return overlayRef?.overlayElement?.parentElement ?? null;
  }

  bringToFront = (dialogId: string, index: number) => {
    let wasFixed = false;

    this.dialogRefs.forEach(ref => {
      const pane = this.getOverlayPane(ref.dialogRef);

      if (pane) {
        pane.classList.remove('dialog-on-top');
      } else if (!pane && ref.modalConfig) {
        this.removeDialogFromRefs(dialogId);
        this.openModal(ref.modalConfig);
        wasFixed = true;
      }
    });

    if (wasFixed) {
      this.snackBar.open(
        'Your modal window data is corrupted. We had to reopen some or all of them. This may have changed the order of your modal windows. ' +
          'The main cause is using history. Close modal windows before using history, and this will not happen again. Thank you for your understanding.',
      );
    }

    const ref = this.dialogRefs.get(dialogId);

    if (!ref) return;

    const pane = this.getOverlayPane(ref.dialogRef);

    if (!pane) return;

    pane.classList.add('dialog-on-top');
    this.selectedDialogRef = index;
  };

  removeDialogFromRefs(key = '') {
    debugger;
    const dialogRef = this.dialogRefs.get(key)?.dialogRef;

    if (dialogRef) {
      dialogRef.close();
      this.dialogRefs.delete(key);
    }
  }

  getModalConfig<T>(
    headerClass = '',
    headerMessage = '',
    closeBtnLabel = '',
    config: {
      callback?: () => void;
      strategy: number;
      component?: any;
      modalRootClass?: string;
      data?: T;
    },
  ) {
    return {
      headerClass: headerClass,
      headerMessage: headerMessage,
      closeBtnLabel: closeBtnLabel,
      config: {
        callback: config.callback,
        strategy: config.strategy,
        component: config.component,
        modalRootClass: config.modalRootClass,
        data: config.data,
      },
    } as ModalConfig<T>;
  }
}
