import { Component, computed, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DragDropComponent } from '../../../../components/abstract/drag-drop/drag-drop.component';
import { TavernaFacadeService } from '../../../../services/facades/taverna/taverna.service';
import { SkillsRenderComponent } from '../../../../components/views/skills-render/skills-render.component';
import { HeroesSelectComponent } from '../../../../components/heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../../store/actions/heroes-select.actions';
import {
  HeroesSelectStateEntity,
  UnitsConfiguratorUnitConfig,
} from '../../../../store/store.interfaces';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { UnitsConfiguratorFeatureActions } from '../../../../store/actions/units-configurator.actions';
import { getUnitKey } from '../../../../store/reducers/units-configurator.reducer';
import { UnitName } from '../../../../models/units-related/unit.model';

@Component({
  selector: 'app-skills-matcher',
  imports: [
    CdkDropList,
    CdkDrag,
    SkillsRenderComponent,
    HeroesSelectComponent,
    HeroesSelectPreviewComponent,
    CdkDropListGroup,
    MatIcon,
    MatIconButton,
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
    const targetElement = event.previousContainer.data[event.previousIndex];
    let active = false;
    const context: HeroesSelectStateEntity = {
      collection: this.contextName,
      name: targetElement.name,
    };

    if (event.container.id === this.cdkList2) {
      const shouldRemove = this.matchedPreviewUnits.find(el => el.name === context.name);

      if (!shouldRemove) {
        this.store.dispatch(HeroesSelectActions.removeHeroFromCollection(context));
        active = false;
      }
    } else {
      const shouldAdd = this.chosenUnits().find(el => el.name === context.name);

      if (!shouldAdd) {
        this.store.dispatch(HeroesSelectActions.addHeroToCollection(context));
        active = true;
      }
    }

    this.updateUnitConfigCover(active, context);
    this.drop(event);
  }

  updateUnitConfigCover(
    active: boolean,
    context: HeroesSelectStateEntity,
    additional?: Pick<UnitsConfiguratorUnitConfig, 'visible'>,
  ) {
    this.store.dispatch(
      UnitsConfiguratorFeatureActions.updateUnitConfig({
        collection: context.collection,
        data: {
          id: getUnitKey(context),
          changes: {
            active,
            ...(additional || {}),
          },
        },
      }),
    );
  }

  removeElementFromRightContainer(name: UnitName) {
    const context = { collection: this.contextName, name };

    this.store.dispatch(HeroesSelectActions.removeHeroFromCollection(context));
    this.updateUnitConfigCover(true, context, { visible: true });

    this.matchedPreviewUnits = this.matchedPreviewUnits.filter(_ => _.name !== name);
  }
}
