import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { BossDifficulty } from '../../../../services/facades/daily-boss/daily-boss.service';

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

  difficultySelected = output<BossDifficulty>();

  select(level: BossDifficulty) {
    this.difficultySelected.emit(level);
  }
}
