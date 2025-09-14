import {Directive, effect, input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appRepeat]',
  standalone: true
})
export class TestDirective {
  appRepeatText = input<string | null | undefined>('');
  appRepeatTail = input<string>('');
  appRepeat = input<number | null | undefined>(null);

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {
    effect(() => {
      this.render(this.appRepeat() || 0, this.appRepeatText() || '', this.appRepeatTail() || '');
    });
  }

  private render(_repeat: number, _message: string, _tail: string) {
    this.vcr.clear();
    for (let i = 0; i < _repeat; i++) {
      this.vcr.createEmbeddedView(this.tpl, {
        $implicit: i,
        message: _message,
        tail: _tail
      });
    }
  }
}
