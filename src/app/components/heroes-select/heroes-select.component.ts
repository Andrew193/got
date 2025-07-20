import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {Unit} from "../../models/unit.model";

@Component({
    selector: 'heroes-select',
    imports: [
        NgForOf,
        NgIf
    ],
    templateUrl: './heroes-select.component.html',
    styleUrl: './heroes-select.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesSelectComponent {
  @Input() title: string = '';
  @Input() containerClass = '';
  @Input() allHeroes: Unit[] = [];
  @Input() isUser: boolean = false;
  @Input() addUserUnit: (unit: Unit, isUser?: boolean) => boolean = () => true
  leftUnits: Map<string, string> = new Map();
  rightUnits: Map<string, string> = new Map();

  public trackByUnit = (index: number, unit: Unit) => {
    return unit.name + this.checkSelected(unit, this.isUser);
  }

  unitClick(unit: Unit) {
    const key = this.isUser ? 'leftUnits' : 'rightUnits';
    const updateCheck = (shouldAdd = true) => {
      (this[key].has(unit.name) || !shouldAdd)
        ? this[key].delete(unit.name)
        : this[key].set(unit.name, unit.name)
    }

    updateCheck(this.addUserUnit(unit, this.isUser));
  }

  public checkSelected = (unit: Unit, user = true) => {
    return user ? this.leftUnits.has(unit.name) : this.rightUnits.has(unit.name);
  }
}
