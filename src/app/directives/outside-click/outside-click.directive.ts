import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appOutsideClick]',
  standalone: true,
})
export class OutsideClickDirective {
  @Output('appOutsideClick') outsideClick = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  onMousedown(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.outsideClick.emit(this.elementRef.nativeElement);
    }
  }

  @HostListener('click', ['$event'])
  onElementClick(event: Event) {
    event.stopPropagation();
  }
}
