import { ChangeDetectionStrategy, Component, computed, inject, input, Input } from '@angular/core';
import { SelectableUnit } from '../../models/unit.model';
import { Store } from '@ngrx/store';
import { selectHeroesCollection } from '../../store/reducers/heroes-select.reducer';
import { HeroesSelectActions } from '../../store/actions/heroes-select.actions';
import { HeroSelectTileComponent } from './hero-select-tile/hero-select-tile.component';
import { HeroesSelectNames } from '../../constants';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroSelectTileComponent],
})
export class HeroesSelectComponent {
  store = inject(Store);
  contextName = input.required<HeroesSelectNames>();

  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  units = computed(() => this.store.selectSignal(selectHeroesCollection(this.contextName()))());

  unitClick(unit: SelectableUnit) {
    const isUser = this.isUser();
    const contextName = this.contextName();

    const updateCheck = (shouldAdd = true) => {
      this.units().includes(unit.name) || !shouldAdd
        ? this.store.dispatch(
            HeroesSelectActions.removeHeroFromCollection({
              name: contextName,
              itemName: unit.name,
            }),
          )
        : this.store.dispatch(
            HeroesSelectActions.addHeroToCollection({ name: contextName, itemName: unit.name }),
          );
    };

    updateCheck(this.addUserUnit(unit, isUser));
  }
}
