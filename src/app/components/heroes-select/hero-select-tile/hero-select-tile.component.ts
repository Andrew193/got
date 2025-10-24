import { Component, inject, input, OnInit, output, signal, Signal } from '@angular/core';
import { SelectableUnit } from '../../../models/units-related/unit.model';
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
export class HeroSelectTileComponent implements OnInit {
  store = inject(Store);

  unit = input.required<SelectableUnit>();
  isUser = input.required<boolean>();
  collectionName = input.required<HeroesSelectNames>();

  selected: Signal<boolean> = signal(false);

  unitClick = output<SelectableUnit>();

  ngOnInit() {
    this.selected = this.store.selectSignal(
      selectHeroState(this.collectionName(), this.unit().name),
    );
  }
}
