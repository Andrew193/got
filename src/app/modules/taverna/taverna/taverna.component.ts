import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BasicStoresHolderComponent } from '../../../components/views/basic-stores-holder/basic-stores-holder.component';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';
import { LoaderService } from '../../../services/resolver-loader/loader.service';
import { frontRoutes } from '../../../constants';
import { ImageComponent } from '../../../components/views/image/image.component';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { HeroesSelectFacadeService } from '../../../services/facades/heroes/helpers/heroes-select-helper.service';
import { ContainerLabelComponent } from '../../../components/views/container-label/container-label.component';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TavernaPagesFooterComponent } from '../views/taverna-pages-footer/taverna-pages-footer.component';
import { TavernaAssistantComponent } from '../taverna-assistant/taverna-assistant.component';

@Component({
  selector: 'app-taverna',
  imports: [
    RouterOutlet,
    BasicStoresHolderComponent,
    PageLoaderComponent,
    ImageComponent,
    ContainerLabelComponent,
    NgClass,
    MatIcon,
    TavernaPagesFooterComponent,
    TavernaAssistantComponent,
  ],
  templateUrl: './taverna.component.html',
  providers: [HeroesSelectFacadeService],
  styleUrl: './taverna.component.scss',
})
export class TavernaComponent {
  helper = inject(TavernaFacadeService);

  loaderService = inject(LoaderService);
  loader = this.loaderService.getPageLoader(frontRoutes.taverna);

  activities = this.helper.activities;
}
