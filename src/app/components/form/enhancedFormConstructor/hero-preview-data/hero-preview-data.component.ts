import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { PreviewUnit, UnitName } from '../../../../models/units-related/unit.model';
import { HeroesSelectNames, TrainingSuf } from '../../../../constants';
import { Coordinate } from '../../../../models/field.model';
import { Store } from '@ngrx/store';
import { UnitsConfiguratorFeatureActions } from '../../../../store/actions/units-configurator.actions';

@Component({
  selector: 'app-hero-preview-data',
  templateUrl: './hero-preview-data.component.html',
  styleUrl: './hero-preview-data.component.scss',
})
export class HeroPreviewDataComponent implements OnInit, OnDestroy {
  store = inject(Store);

  coordinate = input.required<Coordinate>();
  data = input.required<PreviewUnit>();

  isHighlighted(data: PreviewUnit) {
    return data.name.includes(TrainingSuf.ai);
  }

  ngOnInit() {
    const { coordinate, name, data } = this.getDataForDispatch();

    this.store.dispatch(
      UnitsConfiguratorFeatureActions.setUnitCoordinate({
        coordinate,
        collection: this.getCollection(data),
        name,
      }),
    );
  }

  ngOnDestroy() {
    const { name, data } = this.getDataForDispatch();

    this.store.dispatch(
      UnitsConfiguratorFeatureActions.setUnitCoordinate({
        coordinate: { x: -1, y: -1 },
        collection: this.getCollection(data),
        name,
      }),
    );
  }

  getCollection(data: PreviewUnit) {
    return !this.isHighlighted(data)
      ? HeroesSelectNames.userCollection
      : HeroesSelectNames.aiCollection;
  }

  getDataForDispatch() {
    const data = this.data();
    const coordinate = this.coordinate();
    let name = data.name;

    Object.values(TrainingSuf).forEach(_ => {
      name = name.replace(_, '').trim() as UnitName;
    });

    return { coordinate, name, data };
  }
}
