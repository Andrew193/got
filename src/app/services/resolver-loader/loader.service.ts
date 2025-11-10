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
import { BehaviorSubject, finalize, Observable, of } from 'rxjs';
import { InitTaskObs } from '../../models/init.model';
import { frontRoutes } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class LoaderService implements InitInterface {
  private pageLoaderMap = new Map<string, BehaviorSubject<boolean>>([
    [frontRoutes.training, new BehaviorSubject<boolean>(true)],
    [frontRoutes.taverna, new BehaviorSubject<boolean>(true)],
    [frontRoutes.summonTree, new BehaviorSubject<boolean>(true)],
    [frontRoutes.dailyBoss, new BehaviorSubject<boolean>(true)],
  ]);
  private subsCount = new Map<string, number>();

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

  private ensure(page: string): BehaviorSubject<boolean> {
    console.log(page);
    if (!this.pageLoaderMap.has(page)) {
      this.pageLoaderMap.set(page, new BehaviorSubject<boolean>(true));
    }

    return this.pageLoaderMap.get(page)!;
  }

  getPageLoader(page: string): Observable<boolean> {
    const loader$ = this.ensure(page);

    const count = (this.subsCount.get(page) ?? 0) + 1;

    this.subsCount.set(page, count);

    const tid = setTimeout(() => loader$.next(false), 500);

    return loader$.pipe(
      finalize(() => {
        clearTimeout(tid);

        const left = (this.subsCount.get(page) ?? 1) - 1;

        if (left <= 0) {
          this.subsCount.delete(page);
          loader$.next(true);
        } else {
          this.subsCount.set(page, left);
        }
      }),
    );
  }

  resetPageLoader(page: string) {
    const loader$ = this.pageLoaderMap.get(page);

    if (loader$) loader$.next(true);
  }
}
