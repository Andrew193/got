import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Coordinate, Tile, TilesToHighlight} from "../../interface";
import {Unit} from "../../models/unit.model";
import {DebounceClickDirective} from "../../directives/debounce-click/debounce-click.directive";

@Component({
  selector: 'basic-game-board',
  standalone: true,
  imports: [CommonModule, DebounceClickDirective],
  templateUrl: './basic-game-board.component.html',
  styleUrl: './basic-game-board.component.scss'
})
export class BasicGameBoardComponent {
  @Input() gameConfig: any[][] = [];
  @Input() tilesToHighlight: TilesToHighlight[] = [];
  @Input() battleMode: boolean = true;
  @Output() moveEntity = new EventEmitter();
  @Output() highlightMakeMove = new EventEmitter();

  onMoveEntity(tile: Tile) {
    this.moveEntity.emit(tile);
  }

  onHighlightMakeMove(entity: Unit, event: MouseEvent) {
    this.highlightMakeMove.emit({entity, event});
  }

  getTileHighlightClass(tile: Coordinate) {
    const tileFromArray = this.tilesToHighlight.find((el) => el.i === tile.x && el.j === tile.y);
    return tileFromArray?.highlightedClass || ''
  }

  public trackByHighlightedClass = (index: number, tile: Coordinate): string => {
    return this.getTileHighlightClass(tile);
  }

  trackByRowIndex(index: number): number {
    return index;
  }
}
