import { Component, input } from '@angular/core';
import { ExtendedModalConfig } from '../../../modal-interfaces';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-basic-modal-strategy',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './basic-modal-strategy-template.component.html',
  styleUrl: './basic-modal-strategy-template.component.scss',
})
export class BasicModalStrategyTemplateComponent {
  modalConfig = input.required<ExtendedModalConfig>();
}
