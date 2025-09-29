import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Unit } from '../../models/unit.model';
import { OutsideClickDirective } from '../../directives/outside-click/outside-click.directive';
import { Coordinate, Tile, TilesToHighlight } from '../../models/field.model';

@Component({
  selector: 'app-basic-game-board',
  imports: [OutsideClickDirective, NgClass],
  templateUrl: './basic-game-board.component.html',
  styleUrl: './basic-game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicGameBoardComponent {
  @Input() gameConfig: Tile[][] = [];
  @Input() battleMode = true;

  @Output() moveEntity = new EventEmitter<Tile>();
  @Output() highlightMakeMove = new EventEmitter<{
    entity: Unit;
    event: MouseEvent;
    callback: (v: TilesToHighlight[]) => void;
  }>();

  private highlightMap = new Map<string, string>();

  onMoveEntity(tile: Tile) {
    this.moveEntity.emit(tile);
    this.setTilesToHighlight([]);
  }

  onHighlightMakeMove(entity: Unit, event: MouseEvent) {
    this.highlightMakeMove.emit({
      entity,
      event,
      callback: this.setTilesToHighlight.bind(this),
    });
  }

  setTilesToHighlight(list: TilesToHighlight[]) {
    this.highlightMap.clear();
    for (const t of list) this.highlightMap.set(`${t.i}:${t.j}`, t.highlightedClass);
  }

  isHighlighted(tile: Coordinate, cls: string): boolean {
    return this.highlightMap.get(`${tile.x}:${tile.y}`) === cls;
  }

  showActionButtonCondition(tile: Tile, type: string) {
    const entity = (tile as Tile).entity as Unit;

    return this.battleMode
      ? entity[type] &&
          !!entity.health &&
          (entity?.inBattle === true || entity?.inBattle === undefined)
      : entity.user;
  }
}
