import { Component, input, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export enum StarRatingColor {
  primary = 'primary',
  accent = 'accent',
  warn = 'warn',
}

@Component({
  selector: 'app-rating',
  imports: [MatIconButton, MatIcon],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
})
export class RatingComponent implements OnInit {
  rating = input(1);
  starCount = input(6);
  color = input<StarRatingColor>(StarRatingColor.accent);

  protected ratingArr: number[] = [];

  ngOnInit() {
    const starCount = this.starCount();

    for (let index = 0; index < starCount; index++) {
      this.ratingArr.push(index);
    }
  }

  showIcon(index: number) {
    if (this.rating() >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }
}
