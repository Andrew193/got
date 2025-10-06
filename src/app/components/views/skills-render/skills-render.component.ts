import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EffectsHighlighterComponent } from '../../common/effects-highlighter/effects-highlighter.component';
import { ImageComponent } from '../image/image.component';
import { TileUnit } from '../../../models/field.model';

@Component({
  selector: 'app-skills-render',
  imports: [EffectsHighlighterComponent, ImageComponent],
  templateUrl: './skills-render.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsRenderComponent {
  selectedHero = input.required<TileUnit>();
  showLabel = input(true);
  showSkillName = input(false);
}
