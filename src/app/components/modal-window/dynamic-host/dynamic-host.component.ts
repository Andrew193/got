import {Component, input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ExtendedModalConfig, ModalStrategy} from "../modal-interfaces";

@Component({
  selector: 'app-dynamic-modal-host',
  imports: [],
  templateUrl: './dynamic-host.component.html',
  styleUrl: './dynamic-host.component.scss'
})
export class DynamicHostComponent implements OnInit {
  strategy = input.required<ModalStrategy>();
  strategyModalData = input.required<ExtendedModalConfig>();

  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;

  ngOnInit() {
    this.createCustomModalComponent(this.strategy());
  }

  createCustomModalComponent(strategy: ModalStrategy) {
    this.vc.clear();
    const componentRef = strategy.render(this.vc, this.strategyModalData())
  }
}
