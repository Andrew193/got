import {Component} from '@angular/core';
import {Unit} from "../../../interface";
import {PageChangedEvent} from "ngx-bootstrap/pagination";

@Component({
  selector: 'app-base-pagination',
  standalone: true,
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

  constructor() {
    this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
  }

  pageChanged($event: PageChangedEvent) {
    const startItem = ($event.page - 1) * $event.itemsPerPage;
    const endItem = $event.page * $event.itemsPerPage;
    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }
}
