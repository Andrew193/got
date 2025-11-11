import { Component, inject } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { DragDropComponent } from '../../../../components/abstract/drag-drop/drag-drop.component';
import { TavernaFacadeService } from '../../../../services/facades/taverna/taverna.service';
import { SkillsRenderComponent } from '../../../../components/views/skills-render/skills-render.component';
import { TileUnit } from '../../../../models/field.model';

@Component({
  selector: 'app-skills-matcher',
  imports: [CdkDropList, CdkDrag, SkillsRenderComponent],
  templateUrl: './heroes-matcher.component.html',
  styleUrl: './heroes-matcher.component.scss',
})
export class HeroesMatcherComponent extends DragDropComponent {
  facade = inject(TavernaFacadeService);

  matchedTileUnits: TileUnit[] = [];
  allTileUnits = this.facade.getTileUnits();
}
