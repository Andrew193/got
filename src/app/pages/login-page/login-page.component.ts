import {Component, OnInit} from '@angular/core';
import {User, UsersService} from "../../services/users/users.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationService} from "../../services/validation/validation.service";
import {CommonModule} from "@angular/common";
import {FormErrorsContainerComponent} from "../../components/form/form-errors-container/form-errors-container.component";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../services/localStorage/local-storage.service";
import {frontRoutes} from "../../constants";

@Component({
    selector: 'app-login-page',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        FormErrorsContainerComponent
    ],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  form;
  createUser = false;
  onUIFieldsName = {
    login: "Login",
    password: "Password"
  }

  constructor(private usersService: UsersService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private validationService: ValidationService) {
    this.form = new FormGroup({
      login: new FormControl("", [Validators.required, Validators.minLength(4)]),
      password: new FormControl("", [Validators.required, Validators.minLength(4)])
    })
  }

  switchMode() {
    this.createUser = !this.createUser;
  }

  submit() {
    this.validationService.validateFormAndSubmit(this.form, () => {
      this.usersService.login(this.form.value as User, (user) => {
        this.form.enable();
        this.localStorageService.setItem(this.usersService.userToken, user);
        this.router.navigate([frontRoutes.base]);
      })
    }, () => {
      this.usersService.createUser(this.form.value, (user: User) => {
        this.form.enable();
        this.localStorageService.setItem(this.usersService.userToken, user);
        this.router.navigate([frontRoutes.base]);
      })
    }, !this.createUser)
  }

  ngOnInit(): void {
    if (this.usersService.isAuth()) {
      this.router.navigate([frontRoutes.base])
    }
  }
}
