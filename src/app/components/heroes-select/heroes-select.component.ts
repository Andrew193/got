import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { SelectableUnit } from '../../models/unit.model';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroesSelectComponent {
  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  leftUnits: Map<string, string> = new Map<string, string>();
  rightUnits: Map<string, string> = new Map<string, string>();

  unitClick(unit: SelectableUnit) {
    const isUser = this.isUser();

    const key = isUser ? 'leftUnits' : 'rightUnits';
    const updateCheck = (shouldAdd = true) => {
      this[key].has(unit.name) || !shouldAdd
        ? this[key].delete(unit.name)
        : this[key].set(unit.name, unit.name);
    };

    updateCheck(this.addUserUnit(unit, isUser));
  }

  public checkSelected = (unitName: string, user = true) => {
    return user ? this.leftUnits.has(unitName) : this.rightUnits.has(unitName);
  };
}
