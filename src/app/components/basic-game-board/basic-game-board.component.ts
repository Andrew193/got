import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Coordinate, Tile, TilesToHighlight} from "../../interface";
import {Unit} from "../../models/unit.model";
import {trackByIndex} from "../../helpers";
import {OutsideClickDirective} from "../../directives/outside-click/outside-click.directive";

@Component({
    selector: 'basic-game-board',
    imports: [CommonModule, OutsideClickDirective],
    templateUrl: './basic-game-board.component.html',
    styleUrl: './basic-game-board.component.scss'
})
export class BasicGameBoardComponent {
  @Input() gameConfig: any[][] = [];
  @Input() battleMode: boolean = true;
  @Output() moveEntity = new EventEmitter();
  @Output() highlightMakeMove = new EventEmitter();

  private tilesToHighlight: TilesToHighlight[] = [];

  onMoveEntity(tile: Tile) {
    this.tilesToHighlight = [];
    this.moveEntity.emit(tile);
  }

  onHighlightMakeMove(entity: Unit, event: MouseEvent) {
    this.highlightMakeMove.emit({entity, event, callback: this.setTilesToHighlight.bind(this)});
  }

  setTilesToHighlight(tilesToHighlight: TilesToHighlight[]) {
    this.tilesToHighlight = tilesToHighlight;
  }

  getTileHighlightClass(tile: Coordinate) {
    const tileFromArray = this.tilesToHighlight.find((el) => el.i === tile.x && el.j === tile.y);
    return tileFromArray?.highlightedClass || ''
  }

  public trackByCoordinates = (index: number, tile: Tile) => {
    return tile?.x + '-' + tile?.y;
  }

  showActionButtonCondition(tile: Tile, type: string) {
    const entity = (tile as Tile).entity as Unit;
    return this.battleMode ? entity[type] && !!entity.health && (entity?.inBattle === true || entity?.inBattle === undefined): entity.user;
  }

  protected readonly trackByIndex = trackByIndex;
}
