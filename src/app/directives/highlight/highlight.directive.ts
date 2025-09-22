import { Directive, ElementRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  exportAs: 'appHighlight',
})
export class HighlightDirective {
  constructor(
    private el: ElementRef,
    private render: Renderer2,
  ) {}

  @Input() defaultColor = 'yellow';
  @Input('appHighlight') highlightColor = '';

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || this.defaultColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  @HostBinding('style.color') @Input() testColor = '';

  private highlight(color: string) {
    this.render.setStyle(this.el.nativeElement, 'backgroundColor', color);
  }
}
