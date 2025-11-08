import { Component, inject } from '@angular/core';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { ImageComponent } from '../../components/views/image/image.component';
import { RewardComponentInterface } from '../../models/reward-based.model';
import { DecimalPipe } from '@angular/common';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { PageLoaderComponent } from '../../components/views/page-loader/page-loader.component';
import { SummonTreeService } from '../../services/facades/summon-tree/summon-tree.service';

@Component({
  selector: 'app-summon-tree',
  imports: [DisplayRewardComponent, ImageComponent, DecimalPipe, PageLoaderComponent],
  templateUrl: './summon-tree.component.html',
  styleUrl: './summon-tree.component.scss',
})
export class SummonTreeComponent implements RewardComponentInterface {
  facade = inject(SummonTreeService);

  items = this.facade.items;
  rewards = this.facade.rewards;
  getReward = this.facade.getReward;
  contextName = this.facade.contextName;
  loader = this.facade.loader;
  cartPrices = this.facade.cartPrices;

  nav = inject(NavigationService);

  goToMainPage() {
    this.nav.goToMainPage();
  }
}
