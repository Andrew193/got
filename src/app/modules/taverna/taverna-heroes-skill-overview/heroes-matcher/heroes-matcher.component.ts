import { AfterViewInit, ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
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
import { HeroesMatcherActionsComponent } from '../heroes-matcher-actions/heroes-matcher-actions.component';
import { NgStyle } from '@angular/common';

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
    HeroesMatcherActionsComponent,
    NgStyle,
  ],
  templateUrl: './heroes-matcher.component.html',
  styleUrl: './heroes-matcher.component.scss',
})
export class HeroesMatcherComponent extends DragDropComponent implements AfterViewInit {
  cdr = inject(ChangeDetectorRef);
  facade = inject(TavernaFacadeService);
  store = inject(Store);

  unitsSelects = viewChild.required<HeroesSelectComponent>('unitsSelects');
  secondListHeight = 0;

  contextName = this.facade.contextName;

  allUnitsForSelect = this.facade.getTileUnits();

  addUserUnit = this.facade.addUserUnit;
  chosenUnits = this.facade.chosenUnits;
  matchedPreviewUnits = this.facade.matchedPreviewUnits;
  synergyUnits = this.facade.synergyUnits;

  cdkList1 = 'PREVIEW_LIST';
  cdkList2 = 'SELECTED_LIST';

  dropCover(event: CdkDragDrop<typeof this.allUnitsForSelect>) {
    const targetElement = event.previousContainer.data[event.previousIndex];
    const containerId = event.container.id;
    const prevContainerId = event.previousContainer.id;

    if (containerId !== prevContainerId) {
      let active = false;
      const context: HeroesSelectStateEntity = {
        collection: this.contextName,
        name: targetElement.name,
      };

      if (containerId === this.cdkList2) {
        const shouldRemove = this.matchedPreviewUnits().find(el => el.name === context.name);

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

    this.matchedPreviewUnits.update(model => model.filter(_ => _.name !== name));

    const chosenUnit = this.chosenUnits()[0];

    if (chosenUnit) {
      this.chosenUnits.update(() => [this.facade.heroesService.getPreviewUnit(chosenUnit.name)]);
    }
  }

  getContainerHeight() {
    return this.unitsSelects().innerContainer().nativeElement.offsetHeight;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.secondListHeight = this.getContainerHeight();
      this.cdr.markForCheck();
    });
  }
}
