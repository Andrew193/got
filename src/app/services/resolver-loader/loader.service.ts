import {
  computed,
  effect,
  inject,
  Injectable,
  Renderer2,
  signal,
  RendererFactory2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  ResolveEnd,
  ResolveStart,
  Router,
} from '@angular/router';
import { InitInterface } from '../../models/interfaces/init.interface';
import { of } from 'rxjs';
import { InitTaskObs } from '../../models/init.model';

@Injectable({
  providedIn: 'root',
})
export class LoaderService implements InitInterface {
  private readonly activeCount = signal(0);
  readonly isLoading = computed(() => this.activeCount() > 0);
  private router = inject(Router);

  private readonly doc = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  start() {
    this.activeCount.update(n => n + 1);
  }

  stop() {
    this.activeCount.update(n => Math.max(0, n - 1));
  }

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

  init() {
    try {
      this.router.events.subscribe(e => {
        if (e instanceof ResolveStart || e instanceof GuardsCheckStart) {
          this.start();
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (
          e instanceof ResolveEnd ||
          e instanceof GuardsCheckEnd ||
          e instanceof NavigationCancel
        ) {
          this.stop();
        }
      });

      return of({ ok: true, message: 'Loader has been inited' } satisfies InitTaskObs);
    } catch (e) {
      return of({ ok: false, message: 'Failed to init loader' } satisfies InitTaskObs);
    }
  }
}
