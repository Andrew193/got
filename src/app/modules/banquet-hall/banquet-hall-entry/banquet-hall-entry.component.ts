import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-banquet-hall-entry',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class BanquetHallEntryComponent {}
