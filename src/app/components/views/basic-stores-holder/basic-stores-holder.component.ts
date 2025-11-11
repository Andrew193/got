import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { StoresConfig } from '../../../models/stores/stores.model';
import { BASIC_STORES_CONFIG } from '../../../constants';

@Component({
  selector: 'app-basic-stores-placeholder',
  templateUrl: './basic-stores-holder.component.html',
  styleUrl: './basic-stores-holder.component.scss',
  imports: [NgClass],
})
export class BasicStoresHolderComponent {
  title = input<string>('');
  config = input<Partial<StoresConfig>>(BASIC_STORES_CONFIG);

  titleClass = input<string>('mt-0 mb-0');
  navClass = input<string>('');
  innerDivClass = input<string>('m-0');
}
