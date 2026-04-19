import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalWindowService } from './modal-window.service';
import { ModalConfig, ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';

const makeConfig = (overrides: Partial<ModalConfig> = {}): ModalConfig => ({
  headerClass: 'green-b',
  headerMessage: 'You won',
  labels: { closeBtnLabel: 'Great' },
  dialogId: '',
  config: { strategy: ModalStrategiesTypes.component },
  ...overrides,
});

describe('ModalWindowService', () => {
  let service: ModalWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModalWindowService,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    service = TestBed.inject(ModalWindowService);
    ModalWindowService.frozen = false;
  });

  afterEach(() => {
    ModalWindowService.frozen = false;
  });

  describe('Property 6: openModal() returns unique dialogId strings', () => {
    it('returns a non-empty string when not frozen', () => {
      const id = service.openModal(makeConfig());

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('returns distinct IDs for multiple calls', () => {
      const ids = [
        service.openModal(makeConfig()),
        service.openModal(makeConfig()),
        service.openModal(makeConfig()),
        service.openModal(makeConfig()),
        service.openModal(makeConfig()),
      ];
      const unique = new Set(ids);

      expect(unique.size).toBe(ids.length);
    });
  });

  describe('Property 5: openModal() is suppressed when frozen', () => {
    it('returns empty string when frozen', () => {
      ModalWindowService.frozen = true;
      const id = service.openModal(makeConfig());

      expect(id).toBe('');
    });

    it('does not emit to modalConfig$ when frozen', () => {
      ModalWindowService.frozen = true;
      let emitted = false;

      service.modalConfig$.subscribe(v => {
        if (v !== null) emitted = true;
      });
      service.openModal(makeConfig());

      expect(emitted).toBe(false);
    });

    it('dialogRefs size is unchanged when frozen', () => {
      ModalWindowService.frozen = true;
      const sizeBefore = service.dialogRefs.size;

      service.openModal(makeConfig());

      expect(service.dialogRefs.size).toBe(sizeBefore);
    });
  });
});
