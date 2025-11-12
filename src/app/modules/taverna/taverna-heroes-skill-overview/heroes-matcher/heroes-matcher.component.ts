import { Component, computed, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DragDropComponent } from '../../../../components/abstract/drag-drop/drag-drop.component';
import { TavernaFacadeService } from '../../../../services/facades/taverna/taverna.service';
import { SkillsRenderComponent } from '../../../../components/views/skills-render/skills-render.component';
import { HeroesSelectComponent } from '../../../../components/heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../../store/actions/heroes-select.actions';

@Component({
  selector: 'app-skills-matcher',
  imports: [
    CdkDropList,
    CdkDrag,
    SkillsRenderComponent,
    HeroesSelectComponent,
    HeroesSelectPreviewComponent,
    CdkDropListGroup,
  ],
  templateUrl: './heroes-matcher.component.html',
  styleUrl: './heroes-matcher.component.scss',
})
export class HeroesMatcherComponent extends DragDropComponent {
  facade = inject(TavernaFacadeService);
  store = inject(Store);

  contextName = this.facade.contextName;
  allUnitsForSelect = this.facade.getTileUnits();
  addUserUnit = this.facade.addUserUnit;

  chosenUnits = this.facade.chosenUnits;
  synergyUnits = computed(() => {});

  matchedPreviewUnits: typeof this.allUnitsForSelect = [];

  cdkList1 = 'PREVIEW_LIST';
  cdkList2 = 'SELECTED_LIST';

  dropCover(event: CdkDragDrop<typeof this.allUnitsForSelect>) {
    const context = {
      name: this.contextName,
      itemName: event.previousContainer.data[event.previousIndex].name,
    };

    if (event.container.id === this.cdkList2) {
      const shouldRemove = this.matchedPreviewUnits.find(
        el => el.name === event.previousContainer.data[event.previousIndex].name,
      );

      !shouldRemove && this.store.dispatch(HeroesSelectActions.removeHeroFromCollection(context));
    } else {
      const shouldAdd = this.chosenUnits().find(
        el => el.name === event.previousContainer.data[event.previousIndex].name,
      );

      !shouldAdd && this.store.dispatch(HeroesSelectActions.addHeroToCollection(context));
    }

    this.drop(event);
  }
}
