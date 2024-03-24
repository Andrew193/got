import {Component, OnInit} from '@angular/core';
import {HeroesService} from "../../services/heroes/heroes.service";
import {Unit} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {PageChangedEvent, PaginationModule} from "ngx-bootstrap/pagination";
import {RatingModule} from "ngx-bootstrap/rating";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {frontRoutes} from "../../app.routes";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {map, Observable, startWith} from "rxjs";

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
        MatAutocompleteModule
    ],
    templateUrl: './taverna-heroes-bar.component.html',
    styleUrl: './taverna-heroes-bar.component.scss'
})
export class TavernaHeroesBarComponent implements OnInit {
    totalElements = 0;
    currentPage = 1;
    returnedArray: Unit[] = [];
    contentArray: Unit[] = [];
    itemsPerPage = 5;
    formGroup;
    options: string[] = [];
    filteredOptions: Observable<string[]>;

    constructor(public heroesService: HeroesService,
                private router: Router) {
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

        this.formGroup.valueChanges.subscribe((r) => {
            console.log(r)
        })
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }

    ngOnInit(): void {
        this.getHeroes();
        this.returnedArray = this.contentArray.slice(0, this.itemsPerPage);
        this.options = this.heroesService.getAllHeroes().map((hero) => hero.name)
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
