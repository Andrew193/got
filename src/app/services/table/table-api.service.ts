import { inject, Injectable } from '@angular/core';
import { ApiService } from '../abstract/api/api.service';
import { TableConfig, TableConfigApiResponse } from '../../models/table/abstract-table.model';
import { API_ENDPOINTS, TABLE_NAMES } from '../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableApiService<T> extends ApiService<TableConfig<T>> {
  private _snackBar = inject(MatSnackBar);

  private url = `/${API_ENDPOINTS.tables}`;

  saveTableConfig(config: TableConfig<T>, tableName: TABLE_NAMES) {
    console.log(config, tableName, 'dsfs');
    this.putPostCover(
      {
        config,
        tableName,
        userId: this.userId,
      },
      {
        returnObs: false,
        url: this.url,
        callback: () => {
          //this._snackBar.open("Saved")
        },
      },
    );
  }

  getTableConfig(tableName: TABLE_NAMES) {
    return this.http.get<TableConfigApiResponse<T>[]>(this.url).pipe(
      map(configs => {
        return configs.filter(config => {
          return config.userId === this.userId && config.tableName === tableName;
        })[0];
      }),
    );
  }

  getTableData = () => {
    console.log('get data');

    return this.http.get<TableConfigApiResponse<T>[]>(this.url).pipe(
      map(configs => {
        return configs.filter(config => {
          return (
            config.userId === this.userId && config.tableName === TABLE_NAMES.taverna_hero_table
          );
        })[0];
      }),
    );
  };
}
