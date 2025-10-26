import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-notification-marker',
  imports: [AsyncPipe],
  templateUrl: './notification-marker.component.html',
  styleUrl: './notification-marker.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class NotificationMarkerComponent {
  notificationService = inject(NotificationsService);

  notificationType = input.required<NotificationType>();
  notificationConfig = this.notificationService.$notifications;

  protected readonly getNotification = this.notificationService.getNotification;
}
