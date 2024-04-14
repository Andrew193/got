import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TavernaInnerContainerComponent} from "./taverna-inner-container/taverna-inner-container.component";
import {TavernaHeroesBarComponent} from "./taverna-heroes-bar/taverna-heroes-bar.component";
import {TavernaComponent} from "./taverna/taverna.component";
import {TavernaRoutingModule} from "./taverna-routing.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TavernaInnerContainerComponent,
    TavernaHeroesBarComponent,
    TavernaComponent,
    TavernaRoutingModule
  ],
  exports: [
    TavernaInnerContainerComponent,
    TavernaHeroesBarComponent,
    TavernaComponent
  ]
})
export class TavernaModule { }
