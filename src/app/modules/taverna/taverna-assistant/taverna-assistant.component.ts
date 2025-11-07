import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ResponseHolderComponent } from '../../../components/assistant/response-holder/response-holder.component';
import { RequestInputComponent } from '../../../components/assistant/request-input/request-input.component';
import { ASSISTANT_FACADE, ASSISTANT_MEMORY_TYPE } from '../../../models/tokens';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import {
  AssistantComponent,
  AssistantMemory,
} from '../../../models/interfaces/assistant.interface';
import { Store } from '@ngrx/store';
import { AssistantActions } from '../../../store/actions/assistant.actions';

@Component({
  selector: 'app-taverna-assistant',
  imports: [ResponseHolderComponent, RequestInputComponent],
  templateUrl: './taverna-assistant.component.html',
  styleUrl: './taverna-assistant.component.scss',
  providers: [
    { provide: ASSISTANT_MEMORY_TYPE, useValue: AssistantMemory.taverna },
    { provide: ASSISTANT_FACADE, useClass: TavernaFacadeService },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernaAssistantComponent implements AssistantComponent {
  store = inject(Store);

  dropAssistant() {
    this.store.dispatch(AssistantActions.dropAssistant({ memoryType: AssistantMemory.taverna }));
  }

  ngOnDestroy() {
    this.dropAssistant();
  }
}
