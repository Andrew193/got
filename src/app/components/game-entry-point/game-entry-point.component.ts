import {Component, OnInit} from '@angular/core';
import {GameFieldComponent} from "../game-field/game-field.component";
import {AbstractGameFieldComponent} from "../abstract/abstract-game-field/abstract-game-field.component";
import {GameFieldService} from "../../services/game-field/game-field.service";
import {JsonPipe} from "@angular/common";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'game-entry-point',
  standalone: true,
  imports: [
    GameFieldComponent,
    JsonPipe
  ],
  templateUrl: './game-entry-point.component.html',
  styleUrl: './game-entry-point.component.scss'
})
export class GameEntryPointComponent extends AbstractGameFieldComponent implements OnInit{

  constructor(private fieldService: GameFieldService) {
    super(fieldService);
  }

  addBuffToUnit() {
  }

  addEffectToUnit() {
  }

  attack() {
  }

  ngOnInit(): void {
    this.aiUnits = this.aiUnits.map((unit) => ({...unit, user: false}))
    this.userUnits = this.userUnits.map((unit) => ({...unit, user: true}))
  }

  checkDebuffs(unit: Unit, decreaseRestoreCooldown: boolean): Unit {
    return unit;
  }
}
