import { FormControl } from '@angular/forms';

export type TavernaHeroesBarSearchForm = {
  unitName: FormControl<string>;
};

export type TavernaAssistantForm = {
  request: FormControl<string>;
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
};
