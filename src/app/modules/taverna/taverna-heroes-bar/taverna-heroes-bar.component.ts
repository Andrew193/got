import {Component, OnInit} from '@angular/core';
import {HeroesService} from "../../../services/heroes/heroes.service";
import {CommonModule} from "@angular/common";
import {PaginationModule} from "ngx-bootstrap/pagination";
import {RatingModule} from "ngx-bootstrap/rating";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {map, Observable, startWith} from "rxjs";
import {
  AutocompleteMatInputComponent
} from "../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component";
import {BasePaginationComponent} from "../../../components/abstract/base-pagination/base-pagination.component";
import {frontRoutes} from "../../../constants";

@Component({
  selector: 'taverna-heroes-bar',
  standalone: true,
  imports: [
    CommonModule,
    PaginationModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggle,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AutocompleteMatInputComponent
  ],
  templateUrl: './taverna-heroes-bar.component.html',
  styleUrl: './taverna-heroes-bar.component.scss'
})
export class TavernaHeroesBarComponent extends BasePaginationComponent implements OnInit {
  formGroup;
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  constructor(public heroesService: HeroesService,
              private router: Router) {
    super(heroesService);
    this.formGroup = new FormGroup({
      showAll: new FormControl(true),
      unitName: new FormControl('')
    })

    this.filteredOptions = this.formGroup.get('unitName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    )

    this.formGroup.get('unitName')!.valueChanges.subscribe((newName) => {
      const openFirstPage = () => {
        this.currentPage = 1;
        this.pageChanged({itemsPerPage: this.itemsPerPage, page: this.currentPage});
      }
      if (!newName) {
        openFirstPage();
      } else {
        openFirstPage();
        this.returnedArray = this.contentArray.filter((item) => item.name === newName);
      }
    })
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.options = this.heroesService.getAllHeroes().map((hero) => hero.name)
  }

  openHeroPreview(name: string) {
    this.router.navigate([[frontRoutes.taverna, frontRoutes.preview].join("/")], {
      queryParams: {
        name
      }
    })
  }

  backToMainPage() {
    this.router.navigate([frontRoutes.base]);
  }
}
