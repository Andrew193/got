import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ParagraphBlock } from '../../../../../models/watchtower/watchtower.model';
import { TextInputComponent } from '../../../../../components/data-inputs/text-input/text-input.component';

@Component({
  selector: 'app-paragraph-block',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, TextInputComponent],
  templateUrl: './paragraph-block.component.html',
  styleUrl: './paragraph-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphBlockComponent implements OnInit {
  private fb = inject(FormBuilder);

  block = input.required<ParagraphBlock>();
  blockChange = output<ParagraphBlock>();
  remove = output<void>();

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      text: [this.block().text, Validators.required],
    });

    this.form.get('text')?.valueChanges.subscribe(text => {
      this.blockChange.emit({ ...this.block(), text });
    });
  }
}
