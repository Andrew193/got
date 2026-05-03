import {
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  Input,
  model,
  OnInit,
  Output,
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  EqName,
  EQ_FIELD_MAP,
  GearPart,
  HeroesNamesCodes,
  Unit,
} from '../../../../models/units-related/unit.model';
import { Currency } from '../../../../services/users/users.interfaces';
import { HeroProgressService } from '../../../../services/facades/hero-progress/hero-progress.service';
import { MatIcon } from '@angular/material/icon';
import { UpgradeService } from '../../../../services/upgrade/upgrade.service';
import { PriceLabelComponent } from '../../../common/price-label/price-label.component';
import { MAX_EQUIPMENT_LEVEL } from '../../../../constants';

@Component({
  selector: 'app-equipment-card',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatTooltipModule, MatIcon, PriceLabelComponent, DecimalPipe],
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.scss',
  providers: [UpgradeService],
})
export class EquipmentCardComponent implements OnInit {
  private heroProgressService = inject(HeroProgressService);
  upgradeService = inject(UpgradeService);

  @Input({ required: true }) eqName!: EqName;
  hero = input.required<Unit>();
  currency = model.required<Currency>();
  @Input({ required: true }) heroName!: HeroesNamesCodes;
  @Input({ required: true }) userId!: string;
  @Input({ required: true }) getGearDescription!: (name: EqName) => string;
  @Input({ required: true }) gearParts!: GearPart[];
  @Input({ required: true }) getIncrement!: (
    type: 'attackIncrement' | 'defenceIncrement' | 'healthIncrement',
  ) => number;

  @Output() upgraded = new EventEmitter<void>();

  constructor() {
    effect(() => {
      this.upgradeService.currentLevel.set(this.hero()[EQ_FIELD_MAP[this.eqName]]);
    });
  }

  ngOnInit() {
    this.upgradeService.init(
      this.hero()[EQ_FIELD_MAP[this.eqName]],
      this.heroProgressService.getEquipmentUpgradeCost.bind(this.heroProgressService),
      this.currency,
      MAX_EQUIPMENT_LEVEL,
    );
  }

  onUpgrade() {
    const eqField = EQ_FIELD_MAP[this.eqName];

    this.upgradeService.execute(
      this.heroProgressService.upgradeEquipment(
        this.userId,
        this.heroName,
        eqField,
        this.upgradeService.currentLevel(),
      ),
      () => this.upgraded.emit(),
    );
  }
}
