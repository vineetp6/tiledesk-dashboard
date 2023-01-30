import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from './../../../services/logger/logger.service';
import { FaqService } from './../../../services/faq.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Intent } from 'app/models/intent-model';
import { Observable } from 'rxjs';

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-panel-intent-list',
  templateUrl: './panel-intent-list.component.html',
  styleUrls: ['./panel-intent-list.component.scss']
})
export class PanelIntentListComponent implements OnInit {

  @Input() id_faq_kb: string;
  @Input() intent_id: string;
  @Input() projectID: string;
  @Input() eventUpadatedIntent: Observable<any>;
  @Input() eventCreateIntent: Observable<any>;
  @Input() eventStartUpdatedIntent: Observable<any>;
  @Output() selected_intent = new EventEmitter();
  @Output() returnListOfIntents = new EventEmitter();
  @Output() createIntent = new EventEmitter();
  @Output() deleteSelectedIntent = new EventEmitter();
 

  intent_start: Intent;
  intent_defaultFallback: Intent;
  predefined_faqs = [];
  filtered_intents = [];
  intents: Intent[];
  selectedIntent: Intent;
  addBtnDisabled = false

  constructor(
    private faqService: FaqService,
    private logger: LoggerService,
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log("[PANEL-INTENT-LIST] ngOnInit()")
    console.log("[PANEL-INTENT-LIST] - Selected chatbot ID: ", this.id_faq_kb);
    this.getAllIntents(this.id_faq_kb);
    this.onNewIntentListener()
  }

  onNewIntentListener() {
    console.log("[PANEL-INTENT-LIST] onNewIntentListener")
    this.eventCreateIntent.subscribe((intent: Intent) => {
      console.log("[PANEL-INTENT-LIST] ---> ONNEWINTENTLISTENER: ", intent)
      this.getAllIntents(this.id_faq_kb).then((length: number) => {
        console.log("[PANEL-INTENT-LIST] intents length: ", length);
        this.selectIntent(intent, length - 1);
      })
    })
    this.eventUpadatedIntent.subscribe((intent: Intent) => {
      console.log("[PANEL-INTENT-LIST] ---> ON UPDATE INTENTS: ", intent)
      // const index = this.filtered_intents.findIndex((e) => e.id === intent.id);
      // console.log("[PANEL-INTENT-LIST] onNewIntentListener intent index : ", index);
      this.getAllIntents(this.id_faq_kb).then((length: number) => {
        console.log("[PANEL-INTENT-LIST] intents length: ", length);
        this.addBtnDisabled = false;
         const index = this.filtered_intents.findIndex((e) => e.id === intent.id);
         console.log("[PANEL-INTENT-LIST] ON UPDATE INTENTS intent index : ", index);
        this.selectIntent(intent, index);
      })

      this.eventStartUpdatedIntent.subscribe((startUpdating: boolean) => {
        console.log("[PANEL-INTENT-LIST] ---> LISTEN TO START UPDATING INTENT : ", startUpdating)
        this.addBtnDisabled = true;
  
      })
  })

  }

  getAllIntents(id_faq_kb) {

    let promise = new Promise((resolve, reject) => {

      this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
        this.intents = JSON.parse(JSON.stringify(faqs));
        this.returnListOfIntents.emit(faqs);

        this.intent_start = null;
        this.intent_defaultFallback = null;

        let start_index = this.intents.indexOf(this.intents.find(o => o.intent_display_name.trim() === 'start'));
        console.log("start index: ", start_index);
        if (start_index != -1) {
          this.intent_start = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name.trim() === 'start')), 1)[0]
          console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_start: ", this.intent_start);
        }

        let default_index = this.intents.indexOf(this.intents.find(o => o.intent_display_name.trim() === 'defaultFallback'));
        console.log("defaultFallback index: ", default_index);
        if (default_index != -1) {
          this.intent_defaultFallback = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name.trim() === 'defaultFallback')), 1)[0]
          console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_defaultFallback: ", this.intent_defaultFallback);
        }
        this.filtered_intents = this.intents;
        //let element = document.getElementById('intent_' + (this.filtered_intents.length - 2));
        //console.log("element: ", element);
        this.selectIntentFromUrl()
        resolve(this.filtered_intents.length);

      }), (error) => {
        console.error("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - ERROR: ", error)
        reject(error);
      }, () => {
        console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID * COMPLETE")
      }

    })
    return promise

  }

  livesearch(text: string) {
    this.filtered_intents = this.intents;
    this.filtered_intents = this.filtered_intents.filter(element => element.intent_display_name.toLowerCase().includes(text.toLowerCase()));
    //console.log("found those: ", this.filtered_intents)
  }


  selectIntentFromUrl(){
    console.log('selectIntentFromUrl-->', this.intent_id)
    if(this.intent_id !== '0'){
      let index = this.intents.indexOf(this.intents.find(o => o.id === this.intent_id));
      let intent = this.intents.find(el => el.id === this.intent_id)
      this.selectIntent(intent, index)
    }
  }

  selectIntent(intent: Intent, index: number) {
    console.log("[PANEL-INTENT-LIST] selectIntent - intent selected: ", intent);
    console.log("[PANEL-INTENT-LIST] selectIntent - index: ", index)

    let elements = Array.from(document.getElementsByClassName('intent active'));
    elements.forEach((el) => {
      el.classList.remove('active');
    })

    // Issue: the intent is not ready on DOM and is not possible to select it without timeout.
    // Warning: delete the timeout ASAP
    // Try to use MutationObserver for detect changes in the list.
    setTimeout(() => {
      const element = document.getElementById('intent_' + index);
      console.log("[PANEL-INTENT-LIST] element: ", element);
      if (element) {
        element.classList.toggle("active")
        //element.scrollIntoView();
      }
  
      if (!this.selectedIntent || this.selectedIntent.id != intent.id) {
        console.log("[PANEL-INTENT-LIST]  select intent emit");
        this.selectedIntent = intent;
        this.selected_intent.emit(intent);

        this.router.navigate(['project/' + this.projectID + '/cds/' + this.id_faq_kb + '/intent/' + this.selectedIntent.id], { replaceUrl: true })
        
        // this.router.navigate(
        //   ['project/'+this.projectID+'/cds/'+this.id_faq_kb+'/intent/'+this.selectedIntent.id], 
        //   {
        //     relativeTo: this.activatedRoute,
        //     skipLocationChange: true,
        //     // fragment: this.selectedIntent.id,
        //     // queryParamsHandling: 'merge',
        //   });
      }

    }, 200);
  }

  addNewIntent() {
    let elements = Array.from(document.getElementsByClassName('intent active'));
    elements.forEach((el) => {
      el.classList.remove('active');
    })
    this.selectedIntent = null;
    this.createIntent.emit(true);
    // this.router.navigate(['project/' + this.projectID  + '/createfaq', this.id_faq_kb, 'tilebot', 'en']);
  }

  onDeleteButtonClicked(intent) {
    swal({
      title: this.translate.instant('AreYouSure'),
      text: this.translate.instant('TheAnswerWillBeDeleted', { intent_name: intent.intent_display_name }),
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then((WillDelete) => {
      if (WillDelete) {
        this.faqService.deleteFaq(intent.id).subscribe((data) => {
          this.logger.log('[PANEL-INTENT-LIST] delete intent swal RES ', data)
          this.getAllIntents(this.id_faq_kb);
        }, (error) => {
          swal(this.translate.instant('AnErrorOccurredWhilDeletingTheAnswer'), {
            icon: "error"
          })
          this.logger.log('[PANEL-INTENT-LIST] delete intent ERROR ', error)
        }, () => {
          this.logger.log('[PANEL-INTENT-LIST] delete intent * COMPLETE *');
          // this.selectedIntent = null
          console.log('[PANEL-INTENT-LIST] delete  this.selectedIntent ',  this.selectedIntent);
          console.log('[PANEL-INTENT-LIST] delete  intent ',  intent);
          this.reselectselectedIntent()
          if (this.selectedIntent.id === intent.id) {
            this.deleteSelectedIntent.emit(true);
          }
          
          swal(this.translate.instant('Done') + "!", this.translate.instant('FaqPage.AnswerSuccessfullyDeleted'), {
            icon: "success",
          }).then((okpressed) => {
            console.log("ok pressed")
          })
        })
      }
    })
  }

  reselectselectedIntent() {
    setTimeout(() => {
      const index = this.filtered_intents.findIndex((e) => e.id === this.selectedIntent.id);
      console.log('[PANEL-INTENT-LIST] delete  selectedIntent index ', index);
      const element = document.getElementById('intent_' + index);
      console.log("[PANEL-INTENT-LIST] delete: ", element);
      if (element) {
        console.log("[PANEL-INTENT-LIST] delete here yes");
        element.classList.add("active")
        //element.scrollIntoView();
      }
    }, 400);
  }



}
