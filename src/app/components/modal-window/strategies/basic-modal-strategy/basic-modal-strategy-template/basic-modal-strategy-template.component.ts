import { Component, input } from '@angular/core';
import { ExtendedModalConfig } from '../../../modal-interfaces';

@Component({
  selector: 'app-basic-modal-strategy',
  imports: [],
  templateUrl: './basic-modal-strategy-template.component.html',
  styleUrl: './basic-modal-strategy-template.component.scss',
})
export class BasicModalStrategyTemplateComponent {
  modalConfig = input.required<ExtendedModalConfig>();
}
