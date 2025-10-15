import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation/validation.service';
import { FormErrorsContainerComponent } from '../../components/form/form-errors-container/form-errors-container.component';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { SNACKBAR_CONFIG, USER_TOKEN } from '../../constants';
import { UsersService } from '../../services/users/users.service';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { TextInputComponent } from '../../components/data-inputs/text-input/text-input.component';
import { LoginFacadeService } from '../../services/facades/login/login.service';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';
import { AppInitializerFunction } from '../../app.config';
import { APP_INIT_STEPS } from '../../injection-tokens';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    FormErrorsContainerComponent,
    TextInputComponent,
    ModalWindowComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  steps = inject(APP_INIT_STEPS);
  nav = inject(NavigationService);
  facade = inject(LoginFacadeService);
  private snackBar = inject(MatSnackBar);
  showModalComponent = false;

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
    this.showModalComponent = true;
  }

  processing<T>(data: T) {
    if (data instanceof Error) {
      this.form.enable();
      this.snackBar.open(data.message, '', SNACKBAR_CONFIG);
    } else {
      this.showModalComponent = false;

      setTimeout(() => {
        this.localStorageService.setItem(USER_TOKEN, data);

        AppInitializerFunction(this.steps).finally(() => {
          this.form.enable();
          this.nav.goToMainPage();
        });
      }, 0);
    }
  }

  submit() {
    this.showModalComponent = true;

    if (this.createUser) {
      this.facade.openAdventureBegins(this.submitInnerFunction);
    } else {
      this.facade.openAdventureBegins(this.submitInnerFunction);
    }
  }

  submitInnerFunction = () => {
    this.validationService.validateFormAndSubmit(
      this.form,
      this.usersService.login(this.form.value, this.processing.bind(this)),
      this.usersService.createUser(this.form.value, this.processing.bind(this)),
      !this.createUser,
    );
  };

  ngOnInit(): void {
    if (this.usersService.isAuth()) {
      this.nav.goToMainPage();
    }
  }
}
