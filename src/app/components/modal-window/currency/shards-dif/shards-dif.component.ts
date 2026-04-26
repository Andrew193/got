import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HeroesNamesCodes, Rarity } from '../../../../models/units-related/unit.model';

export interface ShardsDifData {
  heroName: HeroesNamesCodes;
  heroImgSrc: string;
  amount: number;
  rarity: Rarity;
}

@Component({
  selector: 'app-shards-dif',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  templateUrl: './shards-dif.component.html',
  styleUrl: './shards-dif.component.scss',
})
export class ShardsDifComponent {
  private snackBarRef = inject(MatSnackBarRef);
  data = inject<ShardsDifData>(MAT_SNACK_BAR_DATA);

  protected readonly rarityLabels: Record<Rarity, string> = {
    [Rarity.COMMON]: 'Common',
    [Rarity.RARE]: 'Rare',
    [Rarity.EPIC]: 'Epic',
    [Rarity.LEGENDARY]: 'Legendary',
  };

  protected close(): void {
    this.snackBarRef.dismissWithAction();
  }
}
