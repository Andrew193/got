import { Component } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { ContentService } from '../../../services/abstract/content/content-service.service';

@Component({
  templateUrl: './base-pagination.component.html',
  styleUrl: './base-pagination.component.scss',
})
export class BasePaginationComponent {
  protected totalElements = 0;
  protected currentPage = 0;
  protected itemsPerPage = 5;
  protected returnedArray: Unit[] = [];
  protected contentArray: Unit[] = [];

  constructor(private contentService: ContentService) {
    this.getInitContent();
  }

  private getInitContent() {
    const elements = this.contentService.getContent();

    this.totalElements = elements.length;
    this.contentArray = elements;
    this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
  }

  protected pageChanged(event: { pageIndex: number; pageSize: number }) {
    const startItem = event.pageIndex * event.pageSize;
    const endItem = startItem + event.pageSize;

    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }
}
