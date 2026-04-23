import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { BossDifficulty } from '../../../../services/abstract/battle-rewards/battle-rewards.service';

type DifficultyConfig = {
  level: BossDifficulty;
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
  selected = input<BossDifficulty | null>(null);
  unlockedDifficulties = input<BossDifficulty[]>([]);

  difficultySelected = output<BossDifficulty>();

  select(level: BossDifficulty) {
    if (!this.unlockedDifficulties().includes(level)) return;
    this.difficultySelected.emit(level);
  }
}
