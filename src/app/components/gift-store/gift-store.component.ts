import {Component, OnInit} from '@angular/core';
import {AbstractGameFieldComponent} from "../abstract/abstract-game-field/abstract-game-field.component";
import {GameFieldService} from "../../services/game-field/game-field.service";
import {GameFieldVars, Skill, Tile, Unit} from "../../interface";
import {HeroesService} from "../../services/heroes/heroes.service";
import {BasicGameBoardComponent} from "../basic-game-board/basic-game-board.component";
import {UnitService} from "../../services/unit/unit.service";
import {GameEntryPointComponent} from "../game-entry-point/game-entry-point.component";
import {NgIf} from "@angular/common";
import {NpcService} from "../../services/npc/npc.service";

@Component({
  selector: 'app-gift-store',
  standalone: true,
  imports: [
    BasicGameBoardComponent,
    GameEntryPointComponent,
    NgIf
  ],
  templateUrl: './gift-store.component.html',
  styleUrl: './gift-store.component.scss'
})
export class GiftStoreComponent extends GameFieldVars implements OnInit {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];
  constructor(private heroService: HeroesService,
              private npcService: NpcService) {
    super();
    this.userUnits.push({...this.heroService.getFreeTrapper(), user: true, attackRange: 1})
    this.aiUnits.push({...this.npcService.getChest(), x:1, y: 4, user: false})

  }

  ngOnInit(): void {
  }

  gameResultsRedirect() {

  }
}
