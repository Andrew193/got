import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost, ModalBase } from '../modal-interfaces';
import { MatDialogRef } from '@angular/material/dialog';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { Coin } from '../../../models/reward-based.model';

@Component({
  selector: 'app-after-battle',
  imports: [],
  templateUrl: './after-battle.component.html',
  styleUrl: './after-battle.component.scss',
})
export class AfterBattleComponent implements Partial<HasFooterHost>, OnInit {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  dialogRef = inject(MatDialogRef<AfterBattleComponent>);
  data = inject<ModalBase & { close: () => void; rewards?: Coin[] }>(DYNAMIC_COMPONENT_DATA);

  ngOnInit() {
    console.log(this.data);
  }
}
