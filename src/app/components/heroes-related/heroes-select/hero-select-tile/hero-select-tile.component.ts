import { Component, inject, input, OnInit, output, signal, Signal } from '@angular/core';
import { SelectableUnit } from '../../../../models/units-related/unit.model';
import { Store } from '@ngrx/store';
import { selectHeroState } from '../../../../store/reducers/heroes-select.reducer';
import { AsyncPipe, NgClass } from '@angular/common';
import { HeroesSelectNames } from '../../../../constants';
import { selectUnitVisibility } from '../../../../store/reducers/units-configurator.reducer';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-hero-select-tile',
  templateUrl: './hero-select-tile.component.html',
  imports: [NgClass, AsyncPipe],
  styleUrl: './hero-select-tile.component.scss',
})
export class HeroSelectTileComponent implements OnInit {
  store = inject(Store);

  unit = input.required<SelectableUnit>();
  isUser = input.required<boolean>();
  collectionName = input.required<HeroesSelectNames>();

  visible: Observable<boolean> = of(true);
  selected: Signal<boolean> = signal(false);

  unitClick = output<SelectableUnit>();

  ngOnInit() {
    const name = this.unit().name;
    const collectionName = this.collectionName();

    this.selected = this.store.selectSignal(selectHeroState(collectionName, name));
    this.visible = this.store.select(selectUnitVisibility({ name, collection: collectionName }));
  }
}
