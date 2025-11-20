import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost } from '../modal-interfaces';
import { MatDialogRef } from '@angular/material/dialog';
import { DepositConfig } from '../../../models/iron-bank.model';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';

@Component({
  selector: 'app-after-battle',
  imports: [],
  templateUrl: './after-battle.component.html',
  styleUrl: './after-battle.component.scss',
})
export class AfterBattleComponent implements HasFooterHost {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  dialogRef = inject(MatDialogRef<AfterBattleComponent>);
  data = inject<DepositConfig>(DYNAMIC_COMPONENT_DATA);
}
