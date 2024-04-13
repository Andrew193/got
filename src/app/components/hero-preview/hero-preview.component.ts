import {Component, OnInit} from '@angular/core';
import {HeroesService} from "../../services/heroes/heroes.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RatingModule} from "ngx-bootstrap/rating";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {StatsComponent} from "../stats/stats.component";
import {frontRoutes} from "../../app.routes";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'app-hero-preview',
  standalone: true,
  imports: [
    RatingModule,
    FormsModule,
    CommonModule,
    StatsComponent
  ],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss'
})
export class HeroPreviewComponent implements OnInit {
  name = "";
  selectedHero: Unit;

  constructor(public heroService: HeroesService,
              private router: Router,
              private route: ActivatedRoute) {
    this.selectedHero = this.heroService.getNightKing();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params)=> {
      this.name = params['name'];
      this.selectedHero = this.heroService.getUnitByName(this.name, {level: 1, rank: 1,   eq1Level: 1,
        eq2Level: 1,
        eq3Level: 1,
        eq4Level: 1
      })
    })
  }

  backToTavern() {
    this.router.navigate([frontRoutes.taverna])
  }

}
