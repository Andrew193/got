import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  output,
} from '@angular/core';
import { Coordinate, Tile, TilesToHighlight, TileUnit } from '../../../models/field.model';
import { basicRewardNames } from '../../../services/reward/reward.service';
import { NgClass } from '@angular/common';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../../store/actions/game-board.actions';
import { selectGameBoardContexts } from '../../../store/reducers/game-board.reducer';

@Component({
  selector: 'app-game-board-tile',
  imports: [NgClass],
  templateUrl: './game-board-tile.component.html',
  styleUrl: './game-board-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardTileComponent {
  store = inject(Store);

  battleMode = input.required<boolean>();
  tile = input.required<Tile>();
  highlightMap = this.store.selectSignal(selectGameBoardContexts);

  moveEntity = output<Tile>();
  @Output() highlightMakeMove = new EventEmitter<{
    entity: TileUnit;
    event: MouseEvent;
    callback: (v: TilesToHighlight[]) => void;
  }>();

  setTilesToHighlight(list: TilesToHighlight[]) {
    this.store.dispatch(GameBoardActions.setTilesToHighlight({ list }));
  }

  isHighlighted(tile: Coordinate, cls: string): boolean {
    const map = this.highlightMap();

    return map[`${tile.x}:${tile.y}`] === cls;
  }

  showActionButtonCondition(tile: Tile, type: keyof TileUnit) {
    const entity = (tile as Tile).entity as TileUnit;

    if (entity.name === basicRewardNames.chest || entity.name === basicRewardNames.copper) {
      return false;
    }

    return this.battleMode() ? entity[type] && !!entity.health : entity.user;
  }

  onMoveEntity(tile: Tile) {
    this.moveEntity.emit(tile);
    this.setTilesToHighlight([]);
  }

  onHighlightMakeMove(entity: TileUnit, event: MouseEvent) {
    this.highlightMakeMove.emit({
      entity,
      event,
      callback: this.setTilesToHighlight.bind(this),
    });
  }
}
