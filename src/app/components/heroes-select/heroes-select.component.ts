import { ChangeDetectionStrategy, Component, input, Input, OnInit } from '@angular/core';
import { HeroesNamesCodes, SelectableUnit } from '../../models/unit.model';
import { RewardValues } from '../../models/reward-based.model';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroesSelectComponent implements OnInit {
  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);
  defaultUnits = input<(HeroesNamesCodes | RewardValues)[]>([]);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  units = new Set<HeroesNamesCodes | RewardValues>();

  ngOnInit() {
    this.units = new Set(this.defaultUnits());
  }

  unitClick(unit: SelectableUnit) {
    const isUser = this.isUser();

    const updateCheck = (shouldAdd = true) => {
      this.units.has(unit.name) || !shouldAdd
        ? this.units.delete(unit.name)
        : this.units.add(unit.name);
    };

    updateCheck(this.addUserUnit(unit, isUser));
  }

  public checkSelected = (unitName: HeroesNamesCodes | RewardValues) => this.units.has(unitName);
}
