import { Injectable } from '@angular/core';
import { ApiService } from '../../abstract/api/api.service';
import { Source } from '../../../models/api.model';
import { of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataInputsService extends ApiService<any> {
  getSelectOptions(source: Source) {
    return of(['Test', 'Rest']).pipe(debounceTime(3000));
    // return this.http.get<string[]>(source);
  }
}
