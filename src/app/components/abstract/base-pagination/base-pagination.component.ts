import { Component, inject } from '@angular/core';
import { PAGINATION_SERVICE } from '../../../models/tokens';

@Component({
  template: '',
})
export class BasePaginationComponent<T> {
  contentService = inject(PAGINATION_SERVICE, { optional: true });

  protected totalElements = 0;
  protected currentPage = 0;
  protected itemsPerPage = 5;
  protected returnedArray: T[] = [];
  protected contentArray: T[] = [];
  protected pageSizeOptions = [5, 10, 25];

  constructor() {
    this.getInitContent();
  }

  private getInitContent() {
    if (this.contentService) {
      const elements = this.contentService.getContent();

      this.totalElements = elements.length;
      this.contentArray = elements;
      this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
    }
  }

  protected pageChanged(event: { pageIndex: number; pageSize: number }) {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;

    const startItem = this.currentPage * this.itemsPerPage;
    const endItem = startItem + this.itemsPerPage;

    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }
}
