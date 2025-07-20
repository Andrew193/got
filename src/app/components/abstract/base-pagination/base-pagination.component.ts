import {Component} from '@angular/core';
import {PageChangedEvent} from "ngx-bootstrap/pagination";
import {Unit} from "../../../models/unit.model";
import {ContentService} from "../../../services/abstract/content/content-service.service";

@Component({
    selector: 'app-base-pagination',
    imports: [],
    templateUrl: './base-pagination.component.html',
    styleUrl: './base-pagination.component.scss'
})
export class BasePaginationComponent {
  totalElements = 0;
  currentPage = 1;
  itemsPerPage = 5;
  returnedArray: Unit[] = [];
  contentArray: Unit[] = [];

  constructor(private contentService: ContentService) {
    this.getInitContent();
  }

  private getInitContent() {
    const elements = this.contentService.getContent();
    this.totalElements = elements.length;
    this.contentArray = elements;
    this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
  }

  pageChanged($event: PageChangedEvent) {
    const startItem = ($event.page - 1) * $event.itemsPerPage;
    const endItem = $event.page * $event.itemsPerPage;
    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }
}
