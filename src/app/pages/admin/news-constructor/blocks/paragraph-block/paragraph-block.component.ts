import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from '../../../../../components/data-inputs/text-input/text-input.component';

@Component({
  selector: 'app-paragraph-block',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, TextInputComponent],
  templateUrl: './paragraph-block.component.html',
  styleUrl: './paragraph-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphBlockComponent {
  formGroup = input.required<FormGroup>();
  remove = output<void>();
}
