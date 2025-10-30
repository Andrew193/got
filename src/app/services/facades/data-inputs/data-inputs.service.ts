import { Injectable } from '@angular/core';
import { ApiService } from '../../abstract/api/api.service';
import { Source } from '../../../models/api.model';
import { Observable, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DATA_SOURCES } from '../../../constants';
import { LabelValue } from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import { HeroType, Rarity } from '../../../models/units-related/unit.model';

@Injectable({
  providedIn: 'root',
})
export class DataInputsService extends ApiService<any> {
  getSelectOptions(source: Source): Observable<LabelValue[]> {
    if (source === DATA_SOURCES.dataInputs) {
      return of([
        { label: 'Test', value: 'Test' },
        { label: 'Rest', value: 'Rest' },
      ]).pipe(debounceTime(3000));
    } else if (source === DATA_SOURCES.heroTypes) {
      return of([
        { label: 'Attack', value: HeroType.ATTACK },
        { label: 'Defence', value: HeroType.DEFENCE },
      ]);
    } else if (source === DATA_SOURCES.heroRarity) {
      return of([
        { label: 'Legendary', value: Rarity.LEGENDARY },
        { label: 'Epic', value: Rarity.EPIC },
        { label: 'Rare', value: Rarity.RARE },
        { label: 'Common', value: Rarity.COMMON },
      ]);
    }

    return of([]);
  }
}
