import { AfterViewInit, Component, input, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { CONTROL_DATA_TYPE, ControlCustomComponent } from '../form-constructor.models';
import { HeroPreviewDataComponent } from '../hero-preview-data/hero-preview-data.component';
import { Coordinate } from '../../../../models/field.model';

export type CustomDataHolderComponentMap = Record<CONTROL_DATA_TYPE, Type<ControlCustomComponent>>;

@Component({
  selector: 'app-custom-data-holder',
  templateUrl: './custom-data-holder.component.html',
})
export class CustomDataHolderComponent implements AfterViewInit {
  type = input.required<CONTROL_DATA_TYPE>();
  data = input({});
  coordinate = input.required<Coordinate>();

  @ViewChild('host', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  map: CustomDataHolderComponentMap = {
    [CONTROL_DATA_TYPE.HERO_PREVIEW]: HeroPreviewDataComponent,
  };

  ngAfterViewInit() {
    this.viewContainerRef.clear();

    const ref = this.viewContainerRef.createComponent(this.map[this.type()]);

    ref.setInput('data', this.data());
    ref.setInput('coordinate', this.coordinate());
  }
}
