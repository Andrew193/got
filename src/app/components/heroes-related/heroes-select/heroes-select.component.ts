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
import { AutocompleteMatInputComponent } from '../../data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeroesSelectFacadeService } from '../../../services/facades/heroes/helpers/heroes-select-helper.service';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';

@Component({
  selector: 'app-heroes-select',
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HeroesSelectFacadeService, TavernaFacadeService],
  imports: [
    HeroSelectTileComponent,
    BasicStoresHolderComponent,
    AutocompleteMatInputComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class HeroesSelectComponent implements OnInit {
  store = inject(Store);

  facade = inject(HeroesSelectFacadeService);
  formGroup = this.facade.formGroup;
  filteredOptions = this.facade.filteredOptions;

  contextName = input.required<HeroesSelectNames>();

  title = input('');
  containerClass = input('');
  allHeroes = input<SelectableUnit[]>([]);
  isUser = input(false);
  showSearchInput = input(true);

  @Input() addUserUnit: (unit: SelectableUnit, isUser?: boolean) => boolean = () => true;

  units: Signal<HeroesSelectStateEntity[]> = signal([]);

  ngOnInit() {
    const contextName = this.contextName();

    this.units = this.store.selectSignal(selectHeroesCollection(contextName));

    this.facade.init(contextName);
  }

  unitClick(unit: SelectableUnit) {
    const isUser = this.isUser();
    const contextName = this.contextName();
    const units = this.units();

    const updateCheck = (shouldAdd = true) => {
      if (shouldAdd) {
        this.store.dispatch(
          HeroesSelectActions.addHeroToCollection({ collection: contextName, name: unit.name }),
        );
      } else if (units.find(_ => _.name === unit.name)) {
        this.store.dispatch(
          HeroesSelectActions.removeHeroFromCollection({
            collection: contextName,
            name: unit.name,
          }),
        );
      }
    };

    updateCheck(this.addUserUnit(unit, isUser));
  }
}
