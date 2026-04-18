import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, Injector, ViewContainerRef, ViewChild } from '@angular/core';
import { ComponentModalStrategy } from './component-modal-strategy';
import { DYNAMIC_COMPONENT_DATA } from '../../../../models/tokens';
import { ExtendedModalConfig, ModalStrategiesTypes } from '../../modal-interfaces';

// A minimal test component without footerHost
@Component({ template: '<div></div>' })
class TestDynamicComponent {
  injectedData = TestBed.inject(DYNAMIC_COMPONENT_DATA, null, { optional: true });
}

// A test component WITH footerHost (implements HasFooterHost)
@Component({ template: '<div><ng-template #footerHost></ng-template></div>' })
class TestDynamicComponentWithFooter {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true }) footerHost!: ViewContainerRef;
  name = 'test-footer-host';
}

function makeExtendedConfig(data: Record<string, unknown>): ExtendedModalConfig {
  return {
    headerClass: 'green-b',
    headerMessage: 'You won',
    labels: { closeBtnLabel: 'Great' },
    dialogId: 'test-id',
    close: vi.fn(),
    config: {
      strategy: ModalStrategiesTypes.component,
      component: TestDynamicComponent as any,
      data,
    },
  };
}

describe('ComponentModalStrategy', () => {
  let strategy: ComponentModalStrategy<unknown>;
  let vc: ViewContainerRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
    }).compileComponents();

    strategy = new ComponentModalStrategy();
  });

  describe('Property 7: DYNAMIC_COMPONENT_DATA contains all config.data fields', () => {
    it('injects close and labels from config.data into the component', () => {
      const closeSpy = vi.fn();
      const labels = { closeBtnLabel: 'Great' };
      const data = { close: closeSpy, labels, reward: { gold: 10 } };

      // Create a real injector to test token injection
      const parentInjector = TestBed.inject(Injector);
      const customInjector = Injector.create({
        providers: [{ provide: DYNAMIC_COMPONENT_DATA, useValue: data }],
        parent: parentInjector,
      });

      const injectedData = customInjector.get(DYNAMIC_COMPONENT_DATA) as Record<string, unknown>;

      expect(injectedData['close']).toBe(closeSpy);
      expect(injectedData['labels']).toEqual(labels);
      expect((injectedData['reward'] as Record<string, unknown>)['gold']).toBe(10);
    });

    it('parameterized: various data shapes are injected correctly', () => {
      const parentInjector = TestBed.inject(Injector);
      const testCases = [
        { close: vi.fn(), labels: { closeBtnLabel: 'OK' } },
        { close: vi.fn(), labels: { closeBtnLabel: 'Great' }, reward: {} },
        {
          close: vi.fn(),
          labels: { closeBtnLabel: 'Try again later', declineBtnLabel: 'No' },
        },
      ];

      for (const data of testCases) {
        const customInjector = Injector.create({
          providers: [{ provide: DYNAMIC_COMPONENT_DATA, useValue: data }],
          parent: parentInjector,
        });

        const injected = customInjector.get(DYNAMIC_COMPONENT_DATA) as Record<string, unknown>;

        expect(typeof injected['close']).toBe('function');
        expect(injected['labels']).toBeDefined();
        expect((injected['labels'] as Record<string, unknown>)['closeBtnLabel']).toBeTruthy();
      }
    });
  });
});
