import {fakeAsync, TestBed} from '@angular/core/testing';
import { LoaderService } from './loader.service';
import {Renderer2, RendererFactory2} from "@angular/core";

describe('LoaderService', () => {
  let loaderService: LoaderService;
  let rendererFactory2Spy: jasmine.SpyObj<RendererFactory2>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;

  beforeEach(() => {
    rendererFactory2Spy = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
    rendererSpy = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    rendererSpy.addClass.and.callFake(() => {});

    rendererSpy.removeClass.and.callFake(() => {})

    rendererFactory2Spy.createRenderer.and.returnValue(rendererSpy);

    TestBed.configureTestingModule({
      providers: [
        LoaderService,
        {provide: RendererFactory2, useValue: rendererFactory2Spy},
      ]
    })

    loaderService = TestBed.inject(LoaderService);

    TestBed.flushEffects();

    rendererSpy.addClass.calls.reset();
    rendererSpy.removeClass.calls.reset();
  })

  it('LoaderService should be created', () => {
    expect(loaderService).toBeTruthy();
  });

  it('LoaderService check start/stop', fakeAsync(() => {
    //Add loader
    loaderService.start();

    TestBed.flushEffects();

    expect(loaderService.isLoading()).toBeTrue();
    expect(rendererSpy.addClass).toHaveBeenCalled();

    //Remove loader
    loaderService.stop();

    TestBed.flushEffects();

    expect(loaderService.isLoading()).toBeFalse();
    expect(rendererSpy.removeClass).toHaveBeenCalled();
  }))
});
