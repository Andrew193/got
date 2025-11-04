import { Component, OnInit } from '@angular/core';
import { ResponseHolderComponent } from './views/response-holder/response-holder.component';
import { RequestInputComponent } from './views/request-input/request-input.component';

@Component({
  selector: 'app-taverna-assistant',
  imports: [ResponseHolderComponent, RequestInputComponent],
  templateUrl: './taverna-assistant.component.html',
  styleUrl: './taverna-assistant.component.scss',
})
export class TavernaAssistantComponent implements OnInit {
  ngOnInit() {}
}
