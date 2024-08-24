import {Routes} from "@angular/router";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {frontRoutes} from "./app.routes";

export const TestRoutes: Routes = [
    {
        component: LoginPageComponent, path: frontRoutes.base
    }
]