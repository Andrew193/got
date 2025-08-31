import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CommonModule} from "@angular/common";
import {TavernaModule} from "./modules/taverna/taverna.module";
import {NotificationsService} from "./services/notifications/notifications.service";
import {OnlineService} from "./services/online/online.service";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CommonModule,
        TavernaModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  notificationsService = inject(NotificationsService);
  online = inject(OnlineService);

  ngOnInit() {
    this.notificationsService.init();
    this.online.trackOnlineTimer();
  }
}
