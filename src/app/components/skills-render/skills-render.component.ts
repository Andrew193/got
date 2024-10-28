import {Component, Input} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Unit} from "../../models/unit.model";
import {HeroesService} from "../../services/heroes/heroes.service";

@Component({
  selector: 'skills-render',
  standalone: true,
    imports: [
        NgForOf
    ],
  templateUrl: './skills-render.component.html',
  styleUrl: './skills-render.component.scss'
})
export class SkillsRenderComponent {
  @Input() selectedHero!: Unit;
  constructor(public heroService: HeroesService) {
  }
}
