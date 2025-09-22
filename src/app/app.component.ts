import { Component, inject, OnInit } from '@angular/core';
import {
  GuardsCheckEnd,
  GuardsCheckStart,
  ResolveEnd,
  ResolveStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationsService } from './services/notifications/notifications.service';
import { OnlineService } from './services/online/online.service';
import { LoaderService } from './services/resolver-loader/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  notificationsService = inject(NotificationsService);
  online = inject(OnlineService);
  loaderService = inject(LoaderService);
  router = inject(Router);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof ResolveStart || e instanceof GuardsCheckStart) {
        this.loaderService.start();
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (e instanceof ResolveEnd || e instanceof GuardsCheckEnd) {
        this.loaderService.stop();
      }
    });
  }

  ngOnInit() {
    this.notificationsService.init();
    this.online.trackOnlineTimer();
  }
}
