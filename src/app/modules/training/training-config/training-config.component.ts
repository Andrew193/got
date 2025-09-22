import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../../models/unit.model';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { Router } from '@angular/router';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HeroesSelectPreviewComponent } from '../../../components/heroes-select-preview/heroes-select-preview.component';
import { HeroesSelectComponent } from '../../../components/heroes-select/heroes-select.component';
import { frontRoutes } from '../../../constants';

@Component({
  selector: 'app-training-config',
  imports: [CommonModule, TooltipModule, HeroesSelectPreviewComponent, HeroesSelectComponent],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingConfigComponent {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];
  aiUnitsDescriptions: boolean[] = [];
  userUnitsDescriptions: boolean[] = [];

  constructor(
    private heroesService: HeroesService,
    private route: Router,
  ) {}

  getDescKey(user = true) {
    return user ? 'userUnitsDescriptions' : 'aiUnitsDescriptions';
  }

  getUnitKey(user = true) {
    return user ? 'userUnits' : 'aiUnits';
  }

  public addUserUnit = (unit: Unit, user = true): boolean => {
    const unitKey = this.getUnitKey(user);
    const descKey = this.getDescKey(user);
    const currentUnits = this[unitKey];
    const index = currentUnits.findIndex(el => el.name === unit.name);

    if (index === -1 && currentUnits.length < 5) {
      const updatedUnits = [...currentUnits, unit];

      this[unitKey] = updatedUnits;
      this[descKey] = updatedUnits.map(() => false);

      return true;
    } else {
      const updatedUnits = currentUnits.filter((_, i) => i !== index);

      this[unitKey] = updatedUnits;
      this[descKey] = updatedUnits.map(() => false);

      return false;
    }
  };

  public toggleDescription = (user: boolean, index: number) => {
    const descKey = this.getDescKey(user);

    this[descKey][index] = !this[descKey][index];
  };

  public getDescriptionState = (user: boolean, index: number) => {
    return this[this.getDescKey(user)][index];
  };

  get allHeroes() {
    return this.heroesService.getAllHeroes();
  }

  openFight() {
    this.userUnits = this.userUnits.map((unit, index) => ({
      ...unit,
      x: 2 + index,
      y: 1,
    }));
    this.aiUnits = this.aiUnits.map((unit, index) => ({
      ...unit,
      x: 2 + index,
      y: 8,
      user: false,
    }));
    this.route.navigateByUrl(frontRoutes.training + '/' + frontRoutes.trainingBattle, {
      state: {
        userUnits: this.userUnits,
        aiUnits: this.aiUnits,
      },
    });
  }

  goToMainPage() {
    this.route.navigate([frontRoutes.base]);
  }
}
