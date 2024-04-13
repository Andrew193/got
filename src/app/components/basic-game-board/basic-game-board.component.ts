import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Tile} from "../../interface";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'basic-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './basic-game-board.component.html',
  styleUrl: './basic-game-board.component.scss'
})
export class BasicGameBoardComponent {
  @Input() gameConfig: any[][] = [];
  @Input() battleMode: boolean = true;
  @Output() moveEntity = new EventEmitter();
  @Output() highlightMakeMove= new EventEmitter();

  onMoveEntity(tile: Tile) {
    this.moveEntity.emit(tile);
  }

  onHighlightMakeMove(entity: Unit, event: MouseEvent) {
    this.highlightMakeMove.emit({entity, event});
  }

}
