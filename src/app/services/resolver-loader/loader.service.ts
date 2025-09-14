import {computed, effect, inject, Injectable, Renderer2, signal, RendererFactory2} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly activeCount = signal(0);
  readonly isLoading = computed(() => this.activeCount() > 0);

  private readonly doc = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  start() { this.activeCount.update(n => n + 1); }
  stop()  { this.activeCount.update(n => Math.max(0, n - 1)); }

  constructor() {
    effect(() => {
      const body = this.doc.body;

      if (this.isLoading()) {
        this.renderer.addClass(body, 'app-loading');
      } else {
        this.renderer.removeClass(body, 'app-loading');
      }
    });
  }
}
