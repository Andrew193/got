import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  exportAs: 'appHighlight',
})
export class HighlightDirective {
  constructor(
    private el: ElementRef,
    private render: Renderer2,
  ) {}
  id!: ReturnType<typeof setTimeout>;

  @Input() defaultColor = 'yellow';
  @Input('appHighlight') highlightColor = '';
  event = output<string>();

  @HostListener('click') onClick() {
    this.id && clearTimeout(this.id);

    this.id = setTimeout(() => {
      this.event.emit('test');
    }, 2000);
  }

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
