import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'heroes-select',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './heroes-select.component.html',
  styleUrl: './heroes-select.component.scss'
})
export class HeroesSelectComponent {
  @Input() title: string = '';
  @Input() allHeroes: Unit[] = [];
  @Input() isUser: boolean = false;
  @Input() addUserUnit: (unit: Unit, isUser?: boolean) => void = () => {
  }
  @Input() checkSelected: (unit: Unit, isUser?: boolean) => boolean = () => false
}
