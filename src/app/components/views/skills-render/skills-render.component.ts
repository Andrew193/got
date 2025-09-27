import { Component, Input } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { EffectsHighlighterComponent } from '../../common/effects-highlighter/effects-highlighter.component';
import { ImageComponent } from '../image/image.component';

@Component({
  selector: 'app-skills-render',
  imports: [EffectsHighlighterComponent, ImageComponent],
  templateUrl: './skills-render.component.html',
})
export class SkillsRenderComponent {
  @Input() selectedHero!: Unit;
}
