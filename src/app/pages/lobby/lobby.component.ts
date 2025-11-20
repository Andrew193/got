import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DailyRewardComponent } from '../../components/daily-reward/daily-reward.component';
import { NotificationMarkerComponent } from '../../directives/notification-marker/notification-marker.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { MatDivider, MatList, MatListItem } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { selectDailyRewardFlag } from '../../store/selectors/lobby.selectors';
import { LobbyService } from '../../services/lobby/lobby.service';
import { ShortcutService } from '../../services/facades/shortcut/shortcut.service';
import { BasicStoresHolderComponent } from '../../components/views/basic-stores-holder/basic-stores-holder.component';
import { ContainerLabelComponent } from '../../components/views/container-label/container-label.component';
import { ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { AfterBattleComponent } from '../../components/modal-window/after-battle/after-battle.component';

export type Route = {
  name: string;
  url: string;
  src: string;
  closed?: boolean;
};

@Component({
  selector: 'app-test-2',
  template: ` <div style="background-color: #750000">Test 3 {{ test() }}</div> `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'test',
})
export class Test2Component implements OnInit {
  test = input('');

  constructor() {}

  ngOnInit() {
    console.log(this.test());
  }
}

@Component({
  selector: 'app-test',
  template: `
    <div style="background-color: #750000">
      Test 2
      <ng-content />
    </div>
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestComponent {
  constructor() {}
}

@Component({
  selector: 'app-user',
  template: `
    <div style="background-color: #70ff70">
      Test
      <ng-content />
    </div>
    <input [(ngModel)]="value" />
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements AfterContentInit {
  test = model.required<{ test: string }>();
  content = contentChildren('secondC', { descendants: true });

  ngAfterContentInit() {
    console.log(this.content());
  }

  get value() {
    return this.test().test;
  }

  set value(newValue) {
    this.test.update(() => ({ test: newValue }));
  }

  constructor() {
    effect(() => {
      console.log(this.test(), 'child');
    });
  }
}

@Component({
  selector: 'app-lobby',
  imports: [
    DailyRewardComponent,
    NotificationMarkerComponent,
    ImageComponent,
    NgTemplateOutlet,
    RouterLink,
    MatList,
    MatListItem,
    MatDivider,
    MatLine,
    AsyncPipe,
    BasicStoresHolderComponent,
    ContainerLabelComponent,
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit {
  shortcutService = inject(ShortcutService);
  destroyRef = inject(DestroyRef);
  modalWindowService = inject(ModalWindowService);

  helper = inject(LobbyService);
  nav = inject(NavigationService);
  store = inject(Store);

  readonly showDailyReward$ = this.store.select(selectDailyRewardFlag);

  showDailyReward = this.helper.showDailyReward;
  activities = this.helper.activities;
  pageRoutes = this.helper.pageRoutes;

  ngOnInit() {
    this.shortcutService.init(this.helper.notation, { destroyRef: this.destroyRef });

    const modalConfig = this.modalWindowService.getModalConfig('', '', '', {
      open: true,
      strategy: ModalStrategiesTypes.component,
      component: AfterBattleComponent,
      data: {},
    });

    //this.modalWindowService.openModal(modalConfig);
  }
}
