import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { PreviewUnit, UnitName } from '../../../../models/units-related/unit.model';
import { TrainingSuf } from '../../../../constants';
import { Coordinate } from '../../../../models/field.model';
import { Store } from '@ngrx/store';
import { TrainingActions } from '../../../../store/actions/training.actions';

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
    console.log('set');
    const { coordinate, name, data } = this.getDataForDispatch();

    this.store.dispatch(
      TrainingActions.setUnitCoordinate({ coordinate, isUser: !this.isHighlighted(data), name }),
    );
  }

  ngOnDestroy() {
    console.log('remove');
    const { name, data } = this.getDataForDispatch();

    this.store.dispatch(
      TrainingActions.setUnitCoordinate({
        coordinate: { x: -1, y: -1 },
        isUser: !this.isHighlighted(data),
        name,
      }),
    );
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
