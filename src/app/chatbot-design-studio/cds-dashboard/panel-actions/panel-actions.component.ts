import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Action, ActionAgent, ActionClose, ActionReply, Intent, Command, Message } from 'app/models/intent-model';
import { TYPE_ACTION } from '../../utils';

@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {


  @Input() isOpenActionDrawer: boolean;
  @Input() intentSelected: Intent
  @Output() openActionDrawer = new EventEmitter();

  // @ViewChild('drawer' ,{ static: false }) drawer: MatDrawer

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges() {

    if (this.isOpenActionDrawer === true) {
      this.isOpenActionDrawer = true
    } else if (this.isOpenActionDrawer === false) {
      this.isOpenActionDrawer = false
    }

    console.log('[PANEL ACTION] isOpenActionDrawer ', this.isOpenActionDrawer)
    console.log('[PANEL ACTION] intentSelected ', this.intentSelected)
    // if (this.isOpenActionDrawer === true)  {
    //   this.drawer.open()
    // } else if (this.isOpenActionDrawer === false)  {
    //   this.drawer.close()
    // }
  }

  closeActionsDrawer() {
    this.isOpenActionDrawer = false
    this.openActionDrawer.emit(this.isOpenActionDrawer);
  }






  actionSelected(action: string) {
    console.log('[PANEL ACTION] actionSelected ', action)
  
    if (action === 'message') {
      let action = new ActionReply();
      let command = new Command(TYPE_ACTION.REPLY);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
      this.intentSelected.actions.push(action)
    }
   

    if (action === 'agenthandoff') {
      let action = new ActionAgent()
    
      this.intentSelected.actions.push(action)
    }

    if (action === 'close') {
      let action = new ActionClose()
     
      this.intentSelected.actions.push(action)
    }
  }

}