import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Unit} from "../../../models/unit.model";
import {frontRoutes} from "../../../app.routes";
import {HeroesService} from "../../../services/heroes/heroes.service";
import {Router} from "@angular/router";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {HeroesChooseComponent} from "../../../components/heroes-choose/heroes-choose.component";
import {HeroesSelectComponent} from "../../../components/heroes-select/heroes-select.component";

@Component({
  selector: 'training-config',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    HeroesChooseComponent,
    HeroesSelectComponent
  ],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss'
})
export class TrainingConfigComponent {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];
  aiUnitsDescriptions: boolean[] = [];
  userUnitsDescriptions: boolean[] = [];

  constructor(private heroesService: HeroesService,
              private route: Router) {
  }

  public addUserUnit = (unit: Unit, user = true) => {
    if (this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name) === -1 && this[user ? 'userUnits' : 'aiUnits'].length < 5) {
      this[user ? 'userUnits' : 'aiUnits'].push(unit);
      this[user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions'] = this[user ? 'userUnits' : 'aiUnits'].map(() => false);
    } else {
      this[user ? 'userUnits' : 'aiUnits'].splice(this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name), 1)
      this[user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions'] = this[user ? 'userUnits' : 'aiUnits'].map(() => false);
    }
  }

  public toggleDescription = (user: boolean, index: number) => {
    this[user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions'][index] = !this[user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions'][index];
  }

  public getDescriptionState = (user: boolean, index: number) => {
    return this[user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions'][index];
  }

  get allHeroes() {
    return this.heroesService.getAllHeroes();
  }

  public checkSelected = (unit: Unit, user = true) => {
    return this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name) !== -1
  }

  openFight() {
    this.userUnits = this.userUnits.map((unit, index) => ({...unit, x: 2 + index, y: 1}))
    this.aiUnits = this.aiUnits.map((unit, index) => ({...unit, x: 2 + index, y: 8, user: false}))
    this.route.navigateByUrl(frontRoutes.training + "/" + frontRoutes.trainingBattle, {
      state: {
        userUnits: this.userUnits,
        aiUnits: this.aiUnits
      },
    })
  }

  goToMainPage() {
    this.route.navigate([frontRoutes.base]);
  }
}
