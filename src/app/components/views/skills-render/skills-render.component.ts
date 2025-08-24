import {Component, Input} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Unit} from "../../../models/unit.model";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {trackBySkill} from "../../../helpers";
import {EffectsHighlighterComponent} from "../../common/effects-highlighter/effects-highlighter.component";
import {ImageComponent} from "../image/image.component";

@Component({
    selector: 'skills-render',
  imports: [
    NgForOf,
    EffectsHighlighterComponent,
    ImageComponent
  ],
    templateUrl: './skills-render.component.html',
    styleUrl: './skills-render.component.scss'
})
export class SkillsRenderComponent {
  @Input() selectedHero!: Unit;

  constructor(public heroService: HeroesService) {
  }

  protected readonly trackBySkill = trackBySkill;
}
