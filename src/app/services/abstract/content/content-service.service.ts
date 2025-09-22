import { Injectable } from '@angular/core';

export enum ContentTypes {
  USER_UNITS,
}

@Injectable({
  providedIn: 'root',
})
export abstract class ContentService {
  abstract getContent(): any[];
}
