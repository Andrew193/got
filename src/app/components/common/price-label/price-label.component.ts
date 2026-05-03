import { Component, input } from '@angular/core';
import { CurrencyLabels } from '../../../models/units-related/unit.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-price-label',
  imports: [DecimalPipe],
  templateUrl: './price-label.component.html',
  styleUrl: './price-label.component.scss',
})
export class PriceLabelComponent {
  currency = input.required<CurrencyLabels>();
  cost = input.required<number>();
  canAfford = input.required<boolean>();
}
