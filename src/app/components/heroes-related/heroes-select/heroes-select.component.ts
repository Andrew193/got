import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  Input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { SelectableUnit } from '../../../models/units-related/unit.model';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { HeroSelectTileComponent } from './hero-select-tile/hero-select-tile.component';
import { HeroesSelectNames } from '../../../constants';
import { HeroesSelectStateEntity } from '../../../store/store.interfaces';
import { selectHeroesCollection } from '../../../store/reducers/heroes-select.reducer';
import { BasicStoresHolderComponent } from '../../views/basic-stores-holder/basic-stores-holder.component';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroSelectTileComponent, BasicStoresHolderComponent],
})
export class HeroesSelectComponent implements OnInit {
  store = inject(Store);
  contextName = input.required<HeroesSelectNames>();

  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  units: Signal<HeroesSelectStateEntity[]> = signal([]);

  ngOnInit() {
    this.units = this.store.selectSignal(selectHeroesCollection(this.contextName()));
  }

  unitClick(unit: SelectableUnit) {
    const isUser = this.isUser();
    const contextName = this.contextName();
    const units = this.units();

    const updateCheck = (shouldAdd = true) => {
      if (shouldAdd) {
        this.store.dispatch(
          HeroesSelectActions.addHeroToCollection({ name: contextName, itemName: unit.name }),
        );
      } else if (units.includes(unit.name)) {
        this.store.dispatch(
          HeroesSelectActions.removeHeroFromCollection({
            name: contextName,
            itemName: unit.name,
          }),
        );
      }
    };

    updateCheck(this.addUserUnit(unit, isUser));
  }
}
