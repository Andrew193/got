import { AdventureBeginsComponent } from './components/modal-window/adventure-begins/adventure-begins.component';
import { AfterBattleComponent } from './components/modal-window/after-battle/after-battle.component';
import { DepositModalComponent } from './components/modal-window/deposit/modal-deposit.component';
import { NotificationComponent } from './components/modal-window/notification/notification.component';
import { ModalDialogRefs } from './models/modal.model';

export const modalWindowsNames: Record<string, Omit<ModalDialogRefs, 'dialogRef'>> = {
  [AdventureBeginsComponent.name]: { name: 'Deposit Information', icon: 'directions_run' },
  [AfterBattleComponent.name]: { name: 'Battle Information', icon: 'castle' },
  [DepositModalComponent.name]: { name: 'Deposit Information', icon: 'currency_exchange' },
  [NotificationComponent.name]: { name: 'Notification Information', icon: 'notifications_active' },
};
