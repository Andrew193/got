import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {MatMenuPanel, MatMenuTrigger} from "@angular/material/menu";
import {HeroesService} from "../../services/heroes/heroes.service";

@Directive({
  selector: '[contextMenuTriggerFor]',
  standalone: true
})
export class ContextMenuTriggerDirective implements OnInit {
  @Input('contextMenuTriggerFor') text = '';
  tipRef!: Element | null;

  constructor(private el: ElementRef,
              private render2: Renderer2,
              private heroService: HeroesService) {
  }

  public ngOnInit(): void {
    this.render2.listen(this.el.nativeElement, 'click', (event) => {
      event.preventDefault();
      this.removeTip();

      const tipContainer = this.render2.createElement('div') as HTMLDivElement;
      tipContainer.innerText = this.heroService.getEffectsFromString(this.text).join(',');
      this.tipRef = tipContainer;
      this.render2.appendChild(this.el.nativeElement, tipContainer)
    })

    this.render2.listen(this.el.nativeElement, 'mouseleave', () => {
      this.removeTip();
    })
  }

  removeTip() {
    if (this.tipRef) {
      this.render2.removeChild(this.el.nativeElement, this.tipRef);
      this.tipRef = null;
    }
  }
}
