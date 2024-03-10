import {AfterViewInit, Component, Input, OnInit, Renderer2, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BsModalRef, BsModalService, ModalModule} from "ngx-bootstrap/modal";
import {Unit} from "../../services/game-field/game-field.service";
import {HeroesService} from "../../services/heroes/heroes.service";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {DomSanitizer} from "@angular/platform-browser";

interface DayReward {
    copperCoin: number,
    silverCoin?: number,
    goldCoin?: number,
    summonScroll?: number,
    summonCard?: number,
    heroShard?: number,
}

@Component({
    selector: 'daily-reward',
    standalone: true,
    imports: [CommonModule, ModalModule, OutsideClickDirective, TooltipModule],
    templateUrl: './daily-reward.component.html',
    styleUrl: './daily-reward.component.scss'
})
export class DailyRewardComponent implements OnInit, AfterViewInit {
    @Input() closePopup: () => void = () => {
    };
    @ViewChild('heroInFrame') heroInFrame: any;
    daysInRow: number = 1;
    isHeroPreview: boolean = false;
    rewardHero: Unit;

    constructor(public heroService: HeroesService,
                private sanitizer:DomSanitizer,
                private render2: Renderer2) {
        this.rewardHero = this.heroService.getBasicUserConfig() as Unit;
    }

    highlightPhrase(text: string) {
        for (let i = 0; i < this.heroService.effectsToHighlight.length; i++) {
            const effect = this.heroService.effectsToHighlight[i];
            text = text.replaceAll(effect, `<span${effect}</span`)
        }

        return this.sanitizer.bypassSecurityTrustHtml(text.replaceAll("<span", "<span class='highlight-effect'>").replaceAll("</span", "</span>"))
    }

    showHeroPreview() {
        this.isHeroPreview = !this.isHeroPreview;
    }

    ngOnInit(): void {
        this.rewardHero = this.heroService.getTargaryenKnight();
    }

    ngAfterViewInit(): void {
        this.render2.setStyle(this.heroInFrame.nativeElement, 'background', `url(${this.rewardHero?.fullImgSrc})`)
    }


    getWeekReward(copperCoinM = 1, silverCoin = 1, vipPointsM = 1, summonCardM = 1, summonScrollM = 1, dayM = 1): DayReward[] {
        return [
            {copperCoin: +(15000 * copperCoinM * dayM).toPrecision(3)},
            {copperCoin: +(20000 * (copperCoinM + 0.4 * dayM)).toPrecision(3)},
            {
                copperCoin: +(25000 * (copperCoinM + 0.2 * dayM)).toPrecision(3),
                silverCoin: +(1000 * silverCoin * dayM).toPrecision(3)
            },
            {
                copperCoin: +(35000 * (copperCoinM + 0.7 * dayM)).toPrecision(3),
                goldCoin: +(250 * (silverCoin + 0.3 * dayM)).toPrecision(3)
            },
            {
                copperCoin: +(45000 * (copperCoinM + 1.2 * dayM)).toPrecision(3),
                summonCard: +(1 * summonCardM * dayM).toPrecision(3)
            },
            {
                copperCoin: +(55000 * (copperCoinM + 1.4 * dayM)).toPrecision(3),
                summonScroll: +(1 * summonScrollM * dayM).toPrecision(3)
            },
            {copperCoin: +(75000 * (copperCoinM + 1.7 * dayM)).toPrecision(3), heroShard: 25}
        ]
    }

    get monthReward(): DayReward[] {
        const rewards = [];
        for (let i = 0; i < 4; i++) {
            rewards.push(...this.getWeekReward(i + 1, i + 1, i + 1, i + 1, i + 1, 1))
        }
        return rewards;
    }

}
