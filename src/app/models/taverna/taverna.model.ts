import { FormControl } from '@angular/forms';
import { AssistantMemory } from '../interfaces/assistant.interface';

export type TavernaHeroesBarSearchForm = {
  unitName: FormControl<string>;
};

export type TavernaHeroesMatcherFrom = {
  newTemplate: FormControl<string>;
  template: FormControl<string>;
};

export type TavernaActivities = {
  label: string;
  imgSrc: string;
  closed?: boolean;
  filterColor?: string;
  click: () => void;
};

export type Keyword = {
  word: string;
  active: boolean;
  assistantMemoryType: AssistantMemory;
};
