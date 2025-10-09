import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation/validation.service';
import { FormErrorsContainerComponent } from '../../components/form/form-errors-container/form-errors-container.component';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { USER_TOKEN } from '../../constants';
import { UsersService } from '../../services/users/users.service';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, FormErrorsContainerComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  nav = inject(NavigationService);

  form;
  createUser = false;
  onUIFieldsName = {
    login: 'Login',
    password: 'Password',
  };

  constructor(
    private usersService: UsersService,
    private localStorageService: LocalStorageService,
    private validationService: ValidationService,
  ) {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.minLength(4)]),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });
  }

  switchMode() {
    this.createUser = !this.createUser;
  }

  processing<T>(user: T) {
    debugger;
    this.form.enable();
    this.localStorageService.setItem(USER_TOKEN, user);
    this.nav.goToMainPage();
  }

  submit() {
    this.validationService.validateFormAndSubmit(
      this.form,
      this.usersService.login(this.form.value, this.processing.bind(this)),
      this.usersService.createUser(this.form.value, this.processing.bind(this)),
      !this.createUser,
    );
  }

  ngOnInit(): void {
    if (this.usersService.isAuth()) {
      this.nav.goToMainPage();
    }
  }
}
