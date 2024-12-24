import { Injectable } from '@angular/core';
import {tap} from "rxjs";
import {IdEntity} from "../../../interface";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(public http: HttpClient) { }

  putPostCover(entity: IdEntity, meta: {url: string,callback : (res: IdEntity)=>void}) {
    const process = {
      next: (response: IdEntity) => {
        meta.callback(response);
      },
      error: (error: any) => {
        console.log(error)
      }
    }
    const url = entity.id ? meta.url + `/${entity.id}` : meta.url;

    if(entity.id) {
      this.http.put<IdEntity>(url, entity).pipe(tap(process)).subscribe();
    } else {
      delete entity.id;
      this.http.post<IdEntity>(url, entity).pipe(tap(process)).subscribe();
    }
  }
}
