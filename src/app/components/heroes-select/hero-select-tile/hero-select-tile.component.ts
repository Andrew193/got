import { Component, computed, inject, input, output } from '@angular/core';
import { SelectableUnit } from '../../../models/unit.model';
import { Store } from '@ngrx/store';
import { selectHeroState } from '../../../store/reducers/heroes-select.reducer';
import { NgClass } from '@angular/common';
import { HeroesSelectNames } from '../../../constants';

@Component({
  selector: 'app-hero-select-tile',
  templateUrl: './hero-select-tile.component.html',
  imports: [NgClass],
  styleUrl: './hero-select-tile.component.scss',
})
export class HeroSelectTileComponent {
  store = inject(Store);

  unit = input.required<SelectableUnit>();
  isUser = input.required<boolean>();
  collectionName = input.required<HeroesSelectNames>();

  selected = computed(() => {
    return this.store.selectSignal(selectHeroState(this.collectionName(), this.unit().name))();
  });

  unitClick = output<SelectableUnit>();
}
