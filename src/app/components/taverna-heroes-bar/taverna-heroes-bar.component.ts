import {Component, OnInit} from '@angular/core';
import {HeroesService} from "../../services/heroes/heroes.service";
import {Unit} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {PageChangedEvent, PaginationModule} from "ngx-bootstrap/pagination";
import {RatingModule} from "ngx-bootstrap/rating";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'taverna-heroes-bar',
  standalone: true,
  imports: [CommonModule, PaginationModule, RatingModule, FormsModule],
  templateUrl: './taverna-heroes-bar.component.html',
  styleUrl: './taverna-heroes-bar.component.scss'
})
export class TavernaHeroesBarComponent implements OnInit {
  totalElements = 0;
  returnedArray: Unit[] = [];
  contentArray: Unit[] = [];
  itemsPerPage = 5;

  constructor(private heroesService: HeroesService) {
  }

  ngOnInit(): void {
    this.getHeroes();
    this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
  }

  getHeroes() {
    const elements = this.heroesService.getAllHeroes();
    this.totalElements = elements.length;
    this.contentArray = elements;
  }

  pageChanged($event: PageChangedEvent) {
    const startItem = ($event.page - 1) * $event.itemsPerPage;
    const endItem = $event.page * $event.itemsPerPage;
    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }

  getRank(level: number) {
    return level <= 10 ? 1 :
      level <= 20 ? 2 :
        level <= 30 ? 3 :
          level <= 40 ? 4 :
            level <= 50 ? 5 : 6
  }
}
