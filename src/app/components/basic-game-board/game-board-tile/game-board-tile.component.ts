import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  output,
  signal,
  Signal,
} from '@angular/core';
import { Tile, TilesToHighlight, TileUnit } from '../../../models/field.model';
import { basicRewardNames } from '../../../services/reward/reward.service';
import { NgClass } from '@angular/common';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../../store/actions/game-board.actions';
import { selectTileToHighlight } from '../../../store/reducers/game-board.reducer';

@Component({
  selector: 'app-game-board-tile',
  imports: [NgClass],
  templateUrl: './game-board-tile.component.html',
  styleUrl: './game-board-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardTileComponent implements OnInit {
  store = inject(Store);

  battleMode = input.required<boolean>();
  tile = input.required<Tile>();
  highlightTile: Signal<TilesToHighlight | null> = signal(null);

  moveEntity = output<Tile>();
  @Output() highlightMakeMove = new EventEmitter<{
    entity: TileUnit;
    event: MouseEvent;
    callback: (v: TilesToHighlight[]) => void;
  }>();

  ngOnInit() {
    this.highlightTile = this.store.selectSignal(selectTileToHighlight(this.tile()));
  }

  setTilesToHighlight(list: TilesToHighlight[]) {
    this.store.dispatch(GameBoardActions.setTilesToHighlight({ list }));
  }

  isHighlighted(cls: string): boolean {
    const highlightTile = this.highlightTile();

    return highlightTile ? highlightTile.highlightedClass === cls : false;
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
