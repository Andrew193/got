import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject, Injectable} from "@angular/core";
import {map, Observable} from "rxjs";
import {UsersService} from "../services/users/users.service";
import {frontRoutes} from "../app.routes";

@Injectable({
    providedIn: 'root'
})
class PermissionsService{

    constructor(private usersService: UsersService,
                private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean> | boolean {
        return this.usersService.doesUserExist().pipe(map((doesUserExist)=>{
          if(doesUserExist) {
            return doesUserExist;
          }
          return this.router.createUrlTree([frontRoutes.login]);
        }));
    }
}

export const AuthGuard: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean> | boolean => {
    return inject(PermissionsService).canActivate();
}
