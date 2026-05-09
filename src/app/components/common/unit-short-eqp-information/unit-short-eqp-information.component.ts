import { Component, input } from '@angular/core';
import { Unit } from '../../../models/units-related/unit.model';

@Component({
  selector: 'app-unit-short-eqp-information',
  imports: [],
  templateUrl: './unit-short-eqp-information.component.html',
  styleUrl: './unit-short-eqp-information.component.scss',
})
export class UnitShortEqpInformationComponent {
  hero = input.required<Unit>();
}
