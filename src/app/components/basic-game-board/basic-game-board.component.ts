import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { OutsideClickDirective } from '../../directives/outside-click/outside-click.directive';
import { Tile, TilesToHighlight, TileUnit } from '../../models/field.model';
import { GameBoardTileComponent } from './game-board-tile/game-board-tile.component';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../store/actions/game-board.actions';

@Component({
  selector: 'app-basic-game-board',
  imports: [OutsideClickDirective, GameBoardTileComponent],
  templateUrl: './basic-game-board.component.html',
  styleUrl: './basic-game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicGameBoardComponent {
  store = inject(Store);

  @Input() gameConfig: Tile[][] = [];
  @Input() battleMode = true;

  @Output() moveEntity = new EventEmitter<Tile>();
  @Output() highlightMakeMove = new EventEmitter<{
    entity: TileUnit;
    event: MouseEvent;
    callback: (v: TilesToHighlight[]) => void;
  }>();

  setTilesToHighlight(list: TilesToHighlight[]) {
    this.store.dispatch(GameBoardActions.setTilesToHighlight({ list }));
  }
}
