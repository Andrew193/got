import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Subject} from "rxjs";
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appDebounceClick]',
  standalone: true
})
export class DebounceClickDirective {
  @Input() debounceTime = 500;
  @Output() debounceClick = new EventEmitter();

  private clicks = new Subject();

  constructor() {
    this.clicks.pipe(
      debounceTime(this.debounceTime)
    ).subscribe(e => this.debounceClick.emit(e));
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    this.clicks.next(event);
  }
}
