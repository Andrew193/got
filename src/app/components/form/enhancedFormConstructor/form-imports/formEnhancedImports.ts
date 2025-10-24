import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ContextMenuTriggerDirective } from '../../../../directives/context-menu-trigger/context-menu-trigger.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../../data-inputs/text-input/text-input.component';
import { JsonPipe, NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/list';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { AutocompleteMatInputComponent } from '../../../data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';

export const formEnhancedImports = [
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  ContextMenuTriggerDirective,
  ReactiveFormsModule,
  TextInputComponent,
  NgForOf,
  MatIcon,
  MatIconButton,
  NgIf,
  MatMenu,
  NgStyle,
  NgClass,
  MatDivider,
  MatSlideToggle,
  MatTooltip,
  MatMiniFabButton,
  MatFabButton,
  MatMenuItem,
  AutocompleteMatInputComponent,
  JsonPipe,
];
