import { Observable } from 'rxjs';
import { HeroesSelectNames } from '../../constants';
import { HeroesMatcherService } from '../../services/facades/taverna/helpers/heroes-matcher.service';

export interface HeroesMatcherInterface {
  saveHeroesMatcherFormTemplate: (templateName?: string) => void;
  loadHeroesMatcherFormTemplate: () => void;
  removeHeroesMatcherFormTemplate: () => void;
  onUiErrorNames: Record<string, string>;
  contextName: HeroesSelectNames;
}

export interface HeroesMatcherInterfaceFacade extends HeroesMatcherInterface {
  filteredTemplateOptions: Observable<string[]>;
  heroesMatcherService: HeroesMatcherService;
}
