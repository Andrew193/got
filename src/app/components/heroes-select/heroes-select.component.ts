import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SelectableUnit } from '../../models/unit.model';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroesSelectComponent implements OnChanges {
  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

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

    console.log('click');

    updateCheck(this.addUserUnit(unit, isUser));
  }

  public checkSelected = (unitName: string, user = true) => {
    return user ? this.leftUnits.has(unitName) : this.rightUnits.has(unitName);
  };
}
