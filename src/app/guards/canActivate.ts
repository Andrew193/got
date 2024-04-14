import {CanActivateFn} from "@angular/router";
import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {UsersService} from "../services/users/users.service";

@Injectable({
    providedIn: 'root'
})
class PermissionsService {

    constructor(private usersService: UsersService) {}

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.usersService.doesUserExist();
    }
}

export const AuthGuard: CanActivateFn = (): Observable<boolean> | Promise<boolean> | boolean => {
    return inject(PermissionsService).canActivate();
}
