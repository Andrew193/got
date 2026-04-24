import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { BattleDifficulty } from '../../../../services/abstract/battle-rewards/battle-rewards.service';

type DifficultyConfig = {
  level: BattleDifficulty;
  heading: string;
};

@Component({
  selector: 'app-campaign-difficulty-selector',
  standalone: true,
  imports: [NgClass],
  templateUrl: './campaign-difficulty-selector.component.html',
  styleUrl: './campaign-difficulty-selector.component.scss',
})
export class CampaignDifficultySelectorComponent {
  configs = input.required<DifficultyConfig[]>();
  selected = input<BattleDifficulty | null>(null);
  unlockedDifficulties = input<BattleDifficulty[]>([]);

  difficultySelected = output<BattleDifficulty>();

  select(level: BattleDifficulty) {
    if (!this.unlockedDifficulties().includes(level)) return;
    this.difficultySelected.emit(level);
  }
}
