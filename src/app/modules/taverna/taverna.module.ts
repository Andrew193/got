import { NgModule } from '@angular/core';
import { TavernaRoutingModule } from './taverna-routing.module';
import { TavernaFacadeService } from '../../services/facades/taverna/taverna.service';

@NgModule({
  declarations: [],
  imports: [TavernaRoutingModule],
  providers: [TavernaFacadeService],
})
export class TavernaModule {}
