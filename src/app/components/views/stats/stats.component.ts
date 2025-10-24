import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Unit } from '../../../models/units-related/unit.model';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

type AllowedStatKey = Extract<
  keyof Unit,
  'attack' | 'defence' | 'health' | 'rage' | 'willpower' | 'dmgReducedBy' | 'canCross'
>;

type StatRow = {
  key: AllowedStatKey;
  icon: string;
  value: () => string | number;
  desc: string;
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, NgTemplateOutlet, FormsModule],
})
export class StatsComponent {
  selectedHero = input.required<Unit>();
  tableMode = input(false);
  statsContainerClass = input('');

  stats = computed<StatRow[]>(() => {
    const h = this.selectedHero();

    return [
      {
        key: 'attack',
        icon: 'assets/resourses/imgs/icons/attack_icon.png',
        value: () => h.attack,
        desc: 'The attack affects the damage dealt by this hero.',
      },
      {
        key: 'defence',
        icon: 'assets/resourses/imgs/icons/def_icon.png',
        value: () => h.defence,
        desc: 'Defense affects the amount of damage absorbed.',
      },
      {
        key: 'health',
        icon: 'assets/resourses/imgs/icons/health_icon.png',
        value: () => h.health,
        desc: 'Health affects the survivability of this hero in battle.',
      },
      {
        key: 'rage',
        icon: 'assets/resourses/imgs/icons/f_power.png',
        value: () => h.rage,
        desc: 'Rage affects the ability to impose a penalty on the enemy.',
      },
      {
        key: 'willpower',
        icon: 'assets/resourses/imgs/icons/anti_f_power.png',
        value: () => h.willpower,
        desc: 'Will power affects the ability to resist penalties.',
      },
      {
        key: 'dmgReducedBy',
        icon: 'assets/resourses/imgs/icons/dmg_red.png',
        value: () => `${(h.dmgReducedBy * 100).toFixed(0)}%`,
        desc: 'Absorption affects the amount of pure damage absorbed (stacks with defense).',
      },
      {
        key: 'canCross',
        icon: 'assets/resourses/imgs/icons/move_icon.png',
        value: () => h.canCross,
        desc: 'Mobility affects the number of cells a hero can move in a turn.',
      },
    ] satisfies StatRow[];
  });
}
