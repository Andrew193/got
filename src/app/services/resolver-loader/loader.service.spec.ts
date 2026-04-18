import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';
import { Renderer2, RendererFactory2 } from '@angular/core';

describe('LoaderService', () => {
  let loaderService: LoaderService;
  let rendererFactory2Spy: { [K in keyof RendererFactory2]: ReturnType<typeof vi.fn> };
  let rendererSpy: { [K in keyof Renderer2]: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    rendererFactory2Spy = { createRenderer: vi.fn() };
    rendererSpy = { addClass: vi.fn(), removeClass: vi.fn() };

    rendererSpy.addClass.mockImplementation(() => {});

    rendererSpy.removeClass.mockImplementation(() => {});

    rendererFactory2Spy.createRenderer.mockReturnValue(rendererSpy);

    TestBed.configureTestingModule({
      providers: [LoaderService, { provide: RendererFactory2, useValue: rendererFactory2Spy }],
    });

    loaderService = TestBed.inject(LoaderService);

    TestBed.flushEffects();

    rendererSpy.addClass.calls.reset();
    rendererSpy.removeClass.calls.reset();
  });

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
  }));
});
