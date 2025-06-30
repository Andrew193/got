import {Routes} from "@angular/router";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {frontRoutes} from "./constants";

export const LoginRoutes: Routes = [
  {
    component: LoginPageComponent, path: frontRoutes.base
  }
]
