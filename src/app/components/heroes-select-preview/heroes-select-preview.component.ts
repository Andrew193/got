import {Component, Input} from '@angular/core';
import {NgForOf} from "@angular/common";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {Unit} from "../../models/unit.model";
import {trackBySkill, trackByUnit} from "../../helpers";

@Component({
    selector: 'heroes-select-preview',
    imports: [
        NgForOf,
        TooltipModule
    ],
    templateUrl: './heroes-select-preview.component.html',
    styleUrl: './heroes-select-preview.component.scss'
})
export class HeroesSelectPreviewComponent {
  @Input() units: Unit[] = [];
  @Input() title: string = '';
  @Input() containerClass = '';
  @Input() user: boolean = false;
  @Input() toggleDescription: (user: boolean, index: number) => void = (user, index) => {
  }
  @Input() getDescriptionState: (user: boolean, index: number) => boolean = (user, index) => false

  protected readonly trackBySkill = trackBySkill;
  protected readonly trackByUnit = trackByUnit;
}
