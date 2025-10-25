import { Component, input } from '@angular/core';

@Component({
  selector: 'app-basic-stores-placeholder',
  templateUrl: './basic-stores-holder.component.html',
  styleUrl: './basic-stores-holder.component.scss',
})
export class BasicStoresHolderComponent {
  title = input<string>('');
}
