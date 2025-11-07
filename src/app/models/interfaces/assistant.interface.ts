import { FormControl, FormGroup } from '@angular/forms';
import { AssistantService } from '../../services/facades/assistant/assistant.service';
import { Observable } from 'rxjs';
import { AssistantRecord } from '../../store/store.interfaces';
import { OnDestroy, OutputEmitterRef, Signal } from '@angular/core';
import { Keyword } from '../taverna/taverna.model';
import { MatChipSelectionChange } from '@angular/material/chips';

export enum AssistantMemory {
  taverna,
}

export type Memory = Record<string, string>;

export type AssistantForm = {
  request: FormControl<string>;
};

export type AssistantFilterForm = {
  filter: FormControl<string[]>;
};

export interface AssistantServiceUser {
  form: FormGroup<AssistantForm>;
  assistant: AssistantService;
  submitAssistantForm: () => void;
}

export interface AssistantFacadeService {
  assistantService: AssistantServiceUser;
  getAssistantFormGroup: () => Pick<AssistantServiceUser, 'form'>[keyof Pick<
    AssistantServiceUser,
    'form'
  >];
}

export interface AssistantComponent extends OnDestroy {
  dropAssistant: () => void;
}

export interface AssistantRequestInputComponent extends Pick<AssistantServiceUser, 'form'> {
  facade: AssistantFacadeService;
  assistantMemoryType: AssistantMemory;
  submitAssistantForm: () => void;
  isLoading: Observable<boolean>;
}

export interface AssistantResponseHolderComponent
  extends Pick<AssistantRequestInputComponent, 'isLoading'> {
  records: Signal<AssistantRecord[]>;
}

export interface AssistantResponseHolderBodyComponent
  extends Pick<AssistantRequestInputComponent, 'facade'> {
  record: Signal<AssistantRecord>;
}

export interface AssistantResponseHolderKeywordsBarComponent<T = MatChipSelectionChange> {
  allKeywords: Observable<Keyword[]>;
  optionChange: (event: T) => void;
  assistantMemoryType: AssistantMemory;
}

export interface AssistantResponseHolderKeywordsFilterComponent {
  filtersChange: OutputEmitterRef<string[]>;
  filtersForm: FormGroup<AssistantFilterForm>;
}
