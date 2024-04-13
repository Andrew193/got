import {Component} from '@angular/core';
import {GameEntryPointComponent} from "../game-entry-point/game-entry-point.component";
import {CommonModule} from "@angular/common";
import {HeroesService} from "../../services/heroes/heroes.service";
import {Router} from "@angular/router";
import {frontRoutes} from "../../app.routes";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    GameEntryPointComponent,
    CommonModule
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent {
  fightStarted = false;
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];

  constructor(private heroesService: HeroesService,
              private route: Router) {
  }

  addUserUnit(unit: Unit, user = true) {
    if (this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name) === -1 && this[user ? 'userUnits' : 'aiUnits'].length < 5) {
      this[user ? 'userUnits' : 'aiUnits'].push(unit)
    } else {
      this[user ? 'userUnits' : 'aiUnits'].splice(this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name), 1)
    }
  }

  get allHeroes() {
    return this.heroesService.getAllHeroes();
  }

  checkSelected(unit: Unit, user = true) {
    return this[user ? 'userUnits' : 'aiUnits'].findIndex((el) => el.name === unit.name) !== -1
  }

  openFight() {
    this.userUnits = this.userUnits.map((unit, index) => ({...unit, x: 2 + index, y: 1}))
    this.aiUnits = this.aiUnits.map((unit, index) => ({...unit, x: 2 + index, y: 8, user: false}))
    this.fightStarted = true;
  }

  goToMainPage() {
    this.route.navigate([frontRoutes.base]);
  }

  public victoryRedirect = () => {
    this.route.navigate([frontRoutes.training]);
    this.userUnits = [];
    this.aiUnits = [];
    this.fightStarted = false;
  }
}
