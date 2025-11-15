import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EffectsHighlighterComponent } from '../../common/effects-highlighter/effects-highlighter.component';
import { ImageComponent } from '../image/image.component';
import { TileUnit } from '../../../models/field.model';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { BasicStoresHolderComponent } from '../basic-stores-holder/basic-stores-holder.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { StoresConfig } from '../../../models/stores/stores.model';
import { BASIC_STORES_CONFIG } from '../../../constants';

@Component({
  selector: 'app-skills-render',
  imports: [
    EffectsHighlighterComponent,
    ImageComponent,
    NgClass,
    BasicStoresHolderComponent,
    MatTabGroup,
    MatTab,
    NgTemplateOutlet,
  ],
  templateUrl: './skills-render.component.html',
  styleUrl: './skills-render.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsRenderComponent {
  selectedHero = input.required<TileUnit>();
  showLabel = input(true);
  label = input<string>('Skills');
  showAsBackground = input(false);
  showSkillName = input(false);
  imageCoverClass = input('');
  sliderMode = input<boolean>(false);
  placeholderConfig = input<Partial<StoresConfig>>(BASIC_STORES_CONFIG);
  containerPaddingClasses = input<string>('ps-2 pe-2');
  convertTextToLowercase = input<boolean>(true);
  renderBySentence = input<boolean>(false);
  storesInnerDivClass = input<string>('');
}
