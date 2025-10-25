import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EffectsHighlighterComponent } from '../../common/effects-highlighter/effects-highlighter.component';
import { ImageComponent } from '../image/image.component';
import { TileUnit } from '../../../models/field.model';
import { NgClass } from '@angular/common';
import { BasicStoresHolderComponent } from '../basic-stores-holder/basic-stores-holder.component';

@Component({
  selector: 'app-skills-render',
  imports: [EffectsHighlighterComponent, ImageComponent, NgClass, BasicStoresHolderComponent],
  templateUrl: './skills-render.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsRenderComponent {
  selectedHero = input.required<TileUnit>();
  showLabel = input(true);
  showAsBackground = input(false);
  showSkillName = input(false);
  imageCoverClass = input('');
}
