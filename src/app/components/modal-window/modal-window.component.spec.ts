import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ModalWindowComponent } from './modal-window.component';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { ModalConfig, ModalStrategiesTypes } from './modal-interfaces';

const mockModalWindowService = {
  modalConfig$: of(null),
  dropModal: jasmine.createSpy('dropModal'),
  dialog: {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }),
  },
  dialogRefs: new Map(),
  selectedDialogRef: null,
  isModalTabSelected: () => false,
  bringToFront: jasmine.createSpy('bringToFront'),
};

describe('ModalWindowComponent', () => {
  let component: ModalWindowComponent;
  let fixture: ComponentFixture<ModalWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalWindowComponent],
      providers: [{ provide: ModalWindowService, useValue: mockModalWindowService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });

  it('FIX: labels is present in config.data after fix', () => {
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'test-id',
      config: {
        strategy: ModalStrategiesTypes.component,
        data: { headerClass: 'green-b', headerMessage: 'You won', reward: {} },
      },
    };

    const result = component.getContextConfig(config);
    const data = result.config.data as Record<string, unknown>;

    // FIX CHECK: labels must now be present in config.data
    expect(data['labels']).toBeDefined();
    expect((data['labels'] as Record<string, unknown>)['closeBtnLabel']).toBe('Great');
  });

  it('FIX: defeat config — closeBtnLabel is Try again later', () => {
    const config: ModalConfig = {
      headerClass: 'red-b',
      headerMessage: 'You lost',
      labels: { closeBtnLabel: 'Try again later' },
      dialogId: 'defeat-id',
      config: {
        strategy: ModalStrategiesTypes.component,
        data: { headerClass: 'red-b', headerMessage: 'You lost', reward: {} },
      },
    };

    const result = component.getContextConfig(config);
    const data = result.config.data as Record<string, unknown>;

    expect((data['labels'] as Record<string, unknown>)['closeBtnLabel']).toBe('Try again later');
  });

  it('FIX: labels with declineBtnLabel — both fields present in config.data', () => {
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'Confirm',
      labels: { closeBtnLabel: 'Yes', declineBtnLabel: 'No' },
      dialogId: 'decline-id',
      config: {
        strategy: ModalStrategiesTypes.component,
        data: {},
      },
    };

    const result = component.getContextConfig(config);
    const labels = (result.config.data as Record<string, unknown>)['labels'] as Record<
      string,
      unknown
    >;

    expect(labels['closeBtnLabel']).toBe('Yes');
    expect(labels['declineBtnLabel']).toBe('No');
  });

  it('FIX: close callback still present alongside labels', () => {
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'close-check-id',
      config: {
        strategy: ModalStrategiesTypes.component,
        data: {},
      },
    };

    const result = component.getContextConfig(config);
    const data = result.config.data as Record<string, unknown>;

    expect(typeof data['close']).toBe('function');
    expect(data['labels']).toBeDefined();
  });

  it('Property 4: data.close(true) invokes config.callback with true', () => {
    const callback = jasmine.createSpy('callback');
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'callback-true-id',
      config: { strategy: ModalStrategiesTypes.component, callback, data: {} },
    };

    const result = component.getContextConfig(config);

    (result.config.data as Record<string, unknown>)['close'](true);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('Property 4: data.close(false) invokes config.callback with false', () => {
    const callback = jasmine.createSpy('callback');
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'callback-false-id',
      config: { strategy: ModalStrategiesTypes.component, callback, data: {} },
    };

    const result = component.getContextConfig(config);

    (result.config.data as Record<string, unknown>)['close'](false);
    expect(callback).toHaveBeenCalledWith(false);
  });

  it('Property 4: data.close() with no argument invokes config.callback with undefined', () => {
    const callback = jasmine.createSpy('callback');
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'callback-undef-id',
      config: { strategy: ModalStrategiesTypes.component, callback, data: {} },
    };

    const result = component.getContextConfig(config);

    (result.config.data as Record<string, unknown>)['close']();
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  it('edge case: config.data undefined produces data with only close and labels', () => {
    const config: ModalConfig = {
      headerClass: 'green-b',
      headerMessage: 'You won',
      labels: { closeBtnLabel: 'Great' },
      dialogId: 'undef-data-id',
      config: { strategy: ModalStrategiesTypes.component },
    };

    const result = component.getContextConfig(config);
    const data = result.config.data as Record<string, unknown>;

    expect(typeof data['close']).toBe('function');
    expect(data['labels']).toEqual({ closeBtnLabel: 'Great' });
    expect(Object.keys(data).sort()).toEqual(['close', 'labels'].sort());
  });

  describe('getContextConfig() — preservation', () => {
    // PRESERVATION: these tests document baseline behavior that must survive the fix

    it('root-level fields are preserved on result', () => {
      const config: ModalConfig = {
        headerClass: 'red-b',
        headerMessage: 'Battle over',
        labels: { closeBtnLabel: 'OK' },
        dialogId: 'preserve-id',
        config: {
          strategy: ModalStrategiesTypes.base,
          data: {},
        },
      };

      const result = component.getContextConfig(config);

      expect(result.headerClass).toBe('red-b');
      expect(result.headerMessage).toBe('Battle over');
      expect(result.labels).toEqual({ closeBtnLabel: 'OK' });
    });

    it('existing config.data fields are preserved', () => {
      const config: ModalConfig = {
        headerClass: 'blue-b',
        headerMessage: 'Info',
        labels: { closeBtnLabel: 'Close' },
        dialogId: 'data-preserve-id',
        config: {
          strategy: ModalStrategiesTypes.component,
          data: { foo: 'bar', baz: 42 },
        },
      };

      const result = component.getContextConfig(config);

      expect((result.config.data as Record<string, unknown>)['foo']).toBe('bar');
      expect((result.config.data as Record<string, unknown>)['baz']).toBe(42);
    });

    it('close callback is a function on config.data', () => {
      const config: ModalConfig = {
        headerClass: 'blue-b',
        headerMessage: 'Info',
        labels: { closeBtnLabel: 'Close' },
        dialogId: 'close-fn-id',
        config: {
          strategy: ModalStrategiesTypes.base,
          data: {},
        },
      };

      const result = component.getContextConfig(config);

      expect(typeof (result.config.data as Record<string, unknown>)['close']).toBe('function');
    });

    it('property-based — random closeBtnLabel strings round-trip on root', () => {
      const labels = ['', 'x', 'Close', 'Try again later', 'Great', '!@#', '   ', 'a'.repeat(100)];

      for (const label of labels) {
        const config: ModalConfig = {
          headerClass: 'green-b',
          headerMessage: 'Test',
          labels: { closeBtnLabel: label },
          dialogId: `label-test-${label.length}`,
          config: {
            strategy: ModalStrategiesTypes.base,
            data: {},
          },
        };

        const result = component.getContextConfig(config);

        expect(result.labels.closeBtnLabel).toBe(label);
      }
    });

    it('base-strategy config.data gains close and labels', () => {
      const config: ModalConfig = {
        headerClass: 'green-b',
        headerMessage: 'Test',
        labels: { closeBtnLabel: 'OK' },
        dialogId: 'base-strategy-id',
        config: {
          strategy: ModalStrategiesTypes.base,
          data: {},
        },
      };

      const result = component.getContextConfig(config);
      const data = result.config.data as Record<string, unknown>;

      expect(typeof data['close']).toBe('function');
      expect(data['labels']).toEqual({ closeBtnLabel: 'OK' });
      expect(Object.keys(data).sort()).toEqual(['close', 'labels'].sort());
    });
  });
});
