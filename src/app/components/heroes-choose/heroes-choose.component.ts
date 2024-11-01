import {Component, Input} from '@angular/core';
import {NgForOf} from "@angular/common";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'heroes-choose',
  standalone: true,
    imports: [
        NgForOf,
        TooltipModule
    ],
  templateUrl: './heroes-choose.component.html',
  styleUrl: './heroes-choose.component.scss'
})
export class HeroesChooseComponent {
  @Input() units: Unit[] = [];
  @Input() title: string = '';
  @Input() user: boolean = false;
  @Input() toggleDescription: (user: boolean, index: number) => void = (user, index) => {}
  @Input() getDescriptionState: (user: boolean, index: number) => boolean = (user, index) => false

}
