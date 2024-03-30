import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[notIf]',
  standalone: true
})
export class TestDirective implements OnInit {
  @Input('notIf') set display(newNotIf: boolean) {
    if(!newNotIf) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  };

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
  }
}
