import { Directive, ElementRef, input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';

@Directive({
  selector: '[appElementLoader]',
})
export class ElementLoaderDirective implements OnInit, OnDestroy {
  beacon = input<Observable<boolean>>(of(false));
  beaconSub!: Subscription;

  constructor(
    private el: ElementRef,
    private render: Renderer2,
  ) {}

  ngOnInit() {
    this.beaconSub = this.beacon().subscribe(res => {
      if (res) {
        this.render.addClass(this.el.nativeElement, 'page-loader');
      } else {
        this.render.removeClass(this.el.nativeElement, 'page-loader');
      }
    });
  }

  ngOnDestroy() {
    this.beaconSub.unsubscribe();
  }
}
