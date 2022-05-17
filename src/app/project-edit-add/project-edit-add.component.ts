import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Router, ActivatedRoute } from '@angular/router';


// USED FOR go back last page
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ProjectPlanService } from '../services/project-plan.service';
import { NotifyService } from '../core/notify.service';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { UsersService } from '../services/users.service';
import * as moment from 'moment';

import { environment } from './../../environments/environment';
import { AppConfigService } from '../services/app-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';
import { LoggerService } from '../services/logger/logger.service';
import { URL_setting_up_automatic_assignment } from './../utils/util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditCardValidator } from 'angular-cc-library';


const swal = require('sweetalert');

type UserFields = 'creditCard' | 'expirationDate' | 'cvc';
type FormErrors = { [u in UserFields]: string };

@Component({
  selector: 'app-project-edit-add',
  templateUrl: './project-edit-add.component.html',
  styleUrls: ['./project-edit-add.component.scss']
})
export class ProjectEditAddComponent implements OnInit, OnDestroy {
  @ViewChild('ccNumber') ccNumberField: ElementRef;
  @ViewChild('ccExpdate') ccExpdateField: ElementRef;

  private unsubscribe$: Subject<any> = new Subject<any>();
  // tparams = brand;
  tparams: any;

  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string;
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  PROJECT_SETTINGS_ROUTE: boolean;
  PROJECT_SETTINGS_PAYMENTS_ROUTE: boolean;
  PROJECT_SETTINGS_AUTH_ROUTE: boolean;
  PROJECT_SETTINGS_ADVANCED_ROUTE: boolean;
  PROJECT_SETTINGS_NOTIFICATION_ROUTE: boolean;
  PROJECT_SETTINGS_SECURITY_ROUTE: boolean;

  showSpinner = true;

  project_name: string;
  projectName_toUpdate: string;
  id_project: string;

  display = 'none';
  displayJwtSecretGeneratedModal = 'none';
  displayConfirmJwtSecretCreationModal = 'none';
  sharedSecret: string;

  DISABLE_UPDATE_BTN = true;
  DISABLE_DELETE_PROJECT_BTN = true;
  project: Project;

  AUTO_SEND_TRANSCRIPT_IS_ON: boolean;

  prjct_name: string;
  prjct_profile_name: string;
  profile_name: string;
  prjct_trial_expired: boolean;
  prjc_trial_days_left: any;
  prjct_profile_type: string;
  subscription_is_active: boolean;
  subscription_end_date: Date;

  displayContactUsModal = 'none';
  subscription: Subscription;

  subscriptionCanceledSuccessfully: string;
  subscriptionCanceledError: string;

  cancelSubscriptionDone = false;
  subscription_payments: any;
  subscription_creation_date: string;
  current_invoice_start_date: string;
  current_invoice_end_date: string;

  stripe_subscription_objct: any;
  days_to_next_renew: number;
  numberOf_agents_seats: number;
  subscription_start_date: string;
  timeOfNextRenew: string;
  plan_amount: string;
  plan_interval: string;
  browser_lang: string;
  countOfPendingInvites: number;
  projectUsersLength: number;
  subscriptionPaymentsLength: number;
  SUBSCRIPTION_BUFFER_DAYS: boolean;

  isVisiblePaymentTab: boolean;
  isVisibleAdvancedTab: boolean;
  isVisibleDeveloperTab: boolean;
  isVisibleNotificationTab: boolean;
  isVisibleSecurityTab: boolean;
  max_agent_assigned_chat: number
  reassignment_delay: number
  automatic_idle_chats: number

  updateSuccessMsg: string;
  updateErrorMsg: string;
  deleteSuccessMsg: string;
  deleteErrorMsg: string;

  // maximum_chats_has_error = false;
  // reassignment_timeout_has_error = false;
  maximum_chats_has_minimum_error = false;
  maximum_chats_has_maximum_error = false;
  reassignment_timeout_has_minimum_error = false;
  reassignment_timeout_has_maximum__error = false;
  automatic_idle_chats_has_minimum_error = false;
  automatic_idle_chats_has_maximum__error = false;

  chat_limit_on: boolean;

  reassignment_on: boolean;

  automatic_unavailable_status_on: boolean;
  // unavailable_status_on: boolean;

  is_disabled_chat_limit_section: boolean;
  is_disabled_reassignment_section: boolean;
  is_disabled_unavailable_status_section: boolean;
  notificationNothingToSave: string;
  onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl: string;
  project_id_to_delete: string;
  SHOW_CIRCULAR_SPINNER = false;
  DISPLAY_DELETE_PRJCT_BTN: boolean;
  DISPLAY_ADVANCED_TAB: boolean;
  isUNIS: boolean = false;

  assigned_conv_on: boolean;
  unassigned_conv_on: boolean;
  ip_restrictions_on: boolean;
  USER_ROLE: string;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  onlyOwnerCanManageEmailTempalte: string;
  onlyAvailableWithEnterprisePlan: string;
  learnMoreAboutDefaultRoles: string;
  TESTSITE_BASE_URL: string;
  TEST_WIDGET_API_BASE_URL: string;
  projectId: string;
  projectName: string;
  contactUsEmail: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  subscription_id: string;
  customer_id: string;
  card_id: string;
  ccform: FormGroup;
  submitted: boolean = false;
  customer_default_payment_method_id: string
  default_card_brand_name: string;
  card_brand: string;
  card_last_four_digits: string;
  form: FormGroup;
  displayAddPaymentMethodModal: string = 'none'
  credit_card_error_msg: string;
  CARD_HAS_ERROR: boolean;
  SPINNER_IN_ADD_CARD_MODAL: boolean;
  CVC_LENGHT: number;
  DISPLAY_ADD_CARD_COMPLETED: boolean = false;
  no_default_payment_method_id_array: Array<string>
  isActiveSubscription: boolean = false;
  isChromeVerGreaterThan100: boolean
  formErrors: FormErrors = {
    'creditCard': '',
    'expirationDate': '',
    'cvc': '',
  };
  validationMessages = {
    'creditCard': {

      'pattern': 'CC Number must be a valid',
    },
    'expirationDate': {

      'pattern': 'expirationDate  must be  valid',
    },
    'cvc': {
      'required': 'is required.',

    },

  };
  allowedIPs: any
  /**
   * 
   * @param projectService 
   * @param router 
   * @param route 
   * @param _location 
   * @param auth 
   * @param prjctPlanService 
   * @param notify 
   * @param usersService 
   * @param translate 
   * @param appConfigService 
   * @param brandService 
   * @param logger 
   */
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService,
    private _fb: FormBuilder,
    // private formGroup: FormGroup

  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;
    if (brand) {
      this.contactUsEmail = brand['contact_us_email'];
    }
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getBrowserVersion()
    this.getCurrentUrlAndSwitchView();
    this.getProjectPlan();
    this.listenCancelSubscription();
    this.translateStrings()
    this.getProjectId();
    this.getBrowserLanguage();
    this.getOSCODE();
    this.getAllUsersOfCurrentProject();
    this.getPendingInvitation();
    this.getProjectUserRole();
    this.getTestSiteUrl();
    this.getCurrentProject();
    //this.checkCurrentStatus();
    this.listenSidebarIsOpened();

    this.buildCreditCardForm()
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  buildCreditCardForm() {

    // this.ccform = this._fb.group({
    //  cardNumber: ['', [CreditCardValidator.validateCardNumber],
    // cardExpDate: ['', [CreditCardValidator.validateCardExpiry],
    // cardCvv: ['', [CreditCardValidator.validateCardCvc],
    // });

    // this.formBuilder = new FormBuilder();
    // this.ccform = this.formBuilder.group({
    //   cardNumber: ['', [CreditCardValidator.validateCardNumber],
    //   cardExpDate: ['', [CreditCardValidator.validateCardExpiry],
    //   cardCvv: ['', [CreditCardValidator.validateCardCvc],
    // });
    this.form = this._fb.group({
      creditCard: ['', [Validators.required]],
      expirationDate: ['', [<any>CreditCardValidator.validateExpDate]],
      cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });

    // this.form = this._fb.group({
    //   creditCard: ['', [Validators.required]],
    //   expirationDate: ['', [Validators.required]],
    //   cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]] 
    // });

    this.form.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const { expirationDate } = this.form.controls
    this.logger.log('onValueChanged expirationDate', expirationDate)
    this.logger.log('onValueChanged expirationDate status', expirationDate.status)

    if (expirationDate.value && expirationDate.value.length === 7) {
      this.logger.log('onValueChanged expirationDate status expirationDate.value.length', expirationDate.value.length)
      if (expirationDate.status === 'INVALID') {

        this.CARD_HAS_ERROR = true
        this.SPINNER_IN_ADD_CARD_MODAL = false
        this.credit_card_error_msg = "The expiration date is invalid"
        this.logger.log('onValueChanged expirationDate INVALID credit_card_error_msg', this.credit_card_error_msg)
      }
      if (expirationDate.status === 'VALID') {

        this.CARD_HAS_ERROR = null
        this.SPINNER_IN_ADD_CARD_MODAL = null
        this.credit_card_error_msg = null
        this.logger.log('onValueChanged expirationDate INVALID credit_card_error_msg', this.credit_card_error_msg)
      }
    }
  }


  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[PRJCT-EDIT-ADD] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project
          // this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT project', this.project);
          this.projectId = project._id;
          this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT projectId ', this.projectId);
          this.projectName = project.name;
          this.logger.log('[PRJCT-EDIT-ADD] GET CURRENT PROJECT projectName ', this.projectName);

        }
      });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[PRJCT-EDIT-ADD] - USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role

        }
      });
  }

  translateStrings() {
    this.translateNotificationMsgs();
    this.translateMsgSubscriptionCanceledSuccessfully();
    this.translateMsgSubscriptionCanceledError();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.translateOnlyATeammateWithTheOwnerRoleCanDeleteAProject();
  }


  translateNotificationMsgs() {
    this.translate.get('ProjectEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] translateNotificationMsgs text', translation)

        this.updateSuccessMsg = translation.UpdateProjectSuccess;
        this.updateErrorMsg = translation.UpdateProjectError;
        this.deleteSuccessMsg = translation.DeleteProjectSuccess
        this.deleteErrorMsg = translation.DeleteProjectError

      });

    this.translate.get('NotificationNothingToSave')
      .subscribe((translation: any) => {
        this.notificationNothingToSave = translation;
      });
  }

  translateOnlyATeammateWithTheOwnerRoleCanDeleteAProject() {
    this.translate.get('OnlyATeammateWithTheOwnerRoleCanDeleteAProject')
      .subscribe((translation: any) => {
        this.onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl = translation;
      });
  }


  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheEmailTemplate')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageEmailTempalte = translation;
      });

    this.translate.get('ProjectEditPage.FeatureOnlyAvailableWithTheEnterprisePlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyAvailableWithEnterprisePlan = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }


  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[PRJCT-EDIT-ADD] - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.countOfPendingInvites = pendingInvitation.length
          this.logger.log('[PRJCT-EDIT-ADD] - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }
      }, error => {
        this.logger.error('[PRJCT-EDIT-ADD] - GET PENDING INVITATION - ERROR', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] - GET PENDING INVITATION - COMPLETE');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] GET PROJECT USERS - RES ', projectUsers);

      if (projectUsers) {
        this.projectUsersLength = projectUsers.length;
        this.logger.log('[PRJCT-EDIT-ADD] # OF PROJECT USERS ', this.projectUsersLength);
      }
    }, error => {
      this.logger.error('[PRJCT-EDIT-ADD] PROJECT USERS - ERROR', error);
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] PROJECT USERS - COMPLETE');
    });
  }


  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[PRJCT-EDIT-ADD] - browser_lang ', this.browser_lang)
  }




  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[PRJCT-EDIT-ADD] keys', keys)
    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisiblePaymentTab = false;
        } else {
          this.isVisiblePaymentTab = true;
        }
      }

      if (key.includes("PSA")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let psa = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - pay key&value', psa);
        if (psa[1] === "F") {
          this.isVisibleAdvancedTab = false;
        } else {
          this.isVisibleAdvancedTab = true;
        }
      }

      if (key.includes("DEV")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let dev = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - dev key&value', dev);
        if (dev[1] === "F") {
          this.isVisibleDeveloperTab = false;
        } else {
          this.isVisibleDeveloperTab = true;
        }
      }

      if (key.includes("NOT")) {
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let not = key.split(":");
        // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - not key&value', not);
        if (not[1] === "F") {
          this.isVisibleNotificationTab = false;
        } else {
          this.isVisibleNotificationTab = true;
        }
      }

      if (key.includes("IPS")) {
        // console.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key', key);
        let ips = key.split(":");
        //  console.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - ips key&value', ips);
        if (ips[1] === "F") {
          this.isVisibleSecurityTab = false;
          // console.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSecurityTab', this.isVisibleSecurityTab);
        } else {
          this.isVisibleSecurityTab = true;
          // console.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - isVisibleSecurityTab', this.isVisibleSecurityTab);
        }
      }

    });

    if (!this.public_Key.includes("PAY")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("PAY")', this.public_Key.includes("PAY"));
      this.isVisiblePaymentTab = false;
    }

    if (!this.public_Key.includes("PSA")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("PSA")', this.public_Key.includes("PSA"));
      this.isVisibleAdvancedTab = false;
    }

    if (!this.public_Key.includes("DEV")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("DEV")', this.public_Key.includes("DEV"));
      this.isVisibleDeveloperTab = false;
    }

    if (!this.public_Key.includes("NOT")) {
      // this.logger.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("NOT")', this.public_Key.includes("NOT"));
      this.isVisibleNotificationTab = false;
    }

    if (!this.public_Key.includes("IPS")) {
      //  console.log('PUBLIC-KEY (PROJECT-EDIT-ADD) - key.includes("IPS")', this.public_Key.includes("IPS"));
      this.isVisibleSecurityTab = false;
    }

  }

  getCurrentUrlAndSwitchView() {
    const currentUrl = this.router.url;
    this.logger.log('[PRJCT-EDIT-ADD] current_url ', currentUrl);

    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_ROUTE ', currentUrl.indexOf('/project-settings/general'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_PAYMENTS_ROUTE ', currentUrl.indexOf('/project-settings/payments'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_AUTH_ROUTE ', currentUrl.indexOf('/project-settings/auth'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_AUTH_ROUTE ', currentUrl.indexOf('/project-settings/advanced'));
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT_SETTINGS_NOTIFICATION ', currentUrl.indexOf('/project-settings/notification'));

    const url_segments = currentUrl.split('/');
    this.logger.log('[PRJCT-EDIT-ADD] - url_segments ', url_segments);

    const nav_project_id = url_segments[2];
    this.logger.log('[PRJCT-EDIT-ADD] - nav_project_id ', nav_project_id);



    if (nav_project_id === '5ec688ed13400f0012c2edc2') {

      this.isUNIS = true;

      // this.isVisibleAdvancedTab = true;
      // this.DISPLAY_ADVANCED_TAB = true;
      this.logger.log('[PRJCT-EDIT-ADD] - isUNIS ', this.isUNIS);
    } else {
      this.isUNIS = false;
      this.logger.log('[PRJCT-EDIT-ADD] - isUNIS ', this.isUNIS);
      // this.isVisibleAdvancedTab = false;
      // this.DISPLAY_ADVANCED_TAB = false;
    }


    /** THE ACTIVE ROUTE IS /project-settings */
    if (
      (currentUrl.indexOf('/project-settings/general') !== -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1)

    ) {
      this.logger.log('%ProjectEditAddComponent router.url', this.router.url);

      this.PROJECT_SETTINGS_ROUTE = true;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_NOTIFICATION ', this.PROJECT_SETTINGS_NOTIFICATION_ROUTE);
      this.logger.log('[PRJCT-EDIT-ADD] - is PROJECT_SETTINGS_SECURITY_ROUTE ', this.PROJECT_SETTINGS_SECURITY_ROUTE);
      /** THE ACTIVE ROUTE IS /project-settings/payments */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') !== -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1)

    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = true;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;

      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);

      /** THE ACTIVE ROUTE IS project-settings/auth */
    } else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') !== -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = true;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }

    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') !== -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = true;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ROUTE ', this.PROJECT_SETTINGS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_PAYMENTS_ROUTE ', this.PROJECT_SETTINGS_PAYMENTS_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_AUTH_ROUTE ', this.PROJECT_SETTINGS_AUTH_ROUTE);
      // this.logger.log('[PRJCT-EDIT-ADD] is PROJECT_SETTINGS_ADVANCED_ROUTE ', this.PROJECT_SETTINGS_ADVANCED_ROUTE);
    }

    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') !== -1) &&
      (currentUrl.indexOf('/project-settings/security') === -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = true;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = false;
    }

    else if (
      (currentUrl.indexOf('/project-settings/general') === -1) &&
      (currentUrl.indexOf('/project-settings/payments') === -1) &&
      (currentUrl.indexOf('/project-settings/auth') === -1) &&
      (currentUrl.indexOf('/project-settings/advanced') === -1) &&
      (currentUrl.indexOf('/project-settings/notification') === -1) &&
      (currentUrl.indexOf('/project-settings/security') !== -1)
    ) {
      this.PROJECT_SETTINGS_ROUTE = false;
      this.PROJECT_SETTINGS_PAYMENTS_ROUTE = false;
      this.PROJECT_SETTINGS_AUTH_ROUTE = false;
      this.PROJECT_SETTINGS_ADVANCED_ROUTE = false;
      this.PROJECT_SETTINGS_NOTIFICATION_ROUTE = false;
      this.PROJECT_SETTINGS_SECURITY_ROUTE = true;
    }

  }




  goToProjectSettings_Payments() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Payments USER_ROLE ', this.USER_ROLE);
    if (this.USER_ROLE === 'owner') {
      this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Payments ');
      this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);

    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }
  presentModalFeautureAvailableOnlyWithEnterprisePlan() {
    const el = document.createElement('div')
    el.innerHTML = this.onlyAvailableWithEnterprisePlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      button: {
        text: "OK",
      },
      dangerMode: false,
    })
  }

  presentModalOnlyOwnerCanManageEmailTempalte() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageEmailTempalte, this.learnMoreAboutDefaultRoles)
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)

  }



  goToProjectSettings_General() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_General ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/general']);
  }

  goToProjectSettings_Auth() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Auth ');
    this.router.navigate(['project/' + this.id_project + '/project-settings/auth']);
  }

  goToProjectSettings_Advanced() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Advanced');
    this.router.navigate(['project/' + this.id_project + '/project-settings/advanced']);
  }

  goToProjectSettings_Notification() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Notification');
    this.router.navigate(['project/' + this.id_project + '/project-settings/notification'])
  }

  goToProjectSettings_Security() {
    this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Security');
    this.router.navigate(['project/' + this.id_project + '/project-settings/security'])
  }

  goToCustomizeNotificationEmailPage() {

    this.logger.log('goToCustomizeNotificationEmailPage profile_name ', this.profile_name)
    if (this.profile_name === 'enterprise') {
      if (this.USER_ROLE === 'owner') {
        this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToCustomizeNotificationEmailPage ');
        this.router.navigate(['project/' + this.id_project + '/notification-email'])
      } else {
        this.presentModalOnlyOwnerCanManageEmailTempalte()
      }
    } else {
      this.presentModalFeautureAvailableOnlyWithEnterprisePlan()
    }
  }

  goToManageEmailSettings() {
    this.logger.log('goToManageEmailSettings profile_name ', this.profile_name)
    if (this.profile_name === 'enterprise') {
      if (this.USER_ROLE === 'owner') {
        this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToManageEmailSettings');
        this.router.navigate(['project/' + this.id_project + '/smtp-settings'])
      } else {
        this.presentModalOnlyOwnerCanManageEmailTempalte()
      }
    } else {
      this.presentModalFeautureAvailableOnlyWithEnterprisePlan()
    }
  }

  // "SubscriptionSuccessfullyCanceled":"Abbonamento annullato correttamente",
  // "AnErrorOccurredWhileCancellingSubscription": "Si è verificato un errore durante l'annullamento dell'abbonamento",
  // TRANSLATION
  translateMsgSubscriptionCanceledSuccessfully() {
    this.translate.get('SubscriptionSuccessfullyCanceled')
      .subscribe((text: string) => {
        this.subscriptionCanceledSuccessfully = text;
      });
  }

  translateMsgSubscriptionCanceledError() {
    this.translate.get('AnErrorOccurredWhileCancellingSubscription')
      .subscribe((text: string) => {
        this.subscriptionCanceledError = text;
      });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
     console.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_name = projectProfileData.name;
        this.prjct_profile_name = projectProfileData.profile_name;
        this.profile_name = projectProfileData.profile_name
        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjc_trial_days_left = projectProfileData.trial_days_left;

        this.numberOf_agents_seats = projectProfileData.profile_agents

        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.subscription_start_date = projectProfileData.subscription_start_date;
        if (projectProfileData.subscription_creation_date) {
          this.subscription_creation_date = projectProfileData.subscription_creation_date;
        } else {
          this.subscription_creation_date = projectProfileData.subscription_start_date;


        }
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data > subscription_creation_date', this.subscription_creation_date)
        this.prjct_profile_type = projectProfileData.profile_type;
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data > prjct_profile_type', this.prjct_profile_type)


        /**
         * *** GET THE subscription_creation_date FROM THE PTOJECT PROFILE ***
         */
        // if (projectProfileData.subscription_creation_date) {
        //   this.subscription_creation_date = projectProfileData.subscription_creation_date;
        //   this.logger.log('ProjectPlanService (ProjectEditAddComponent) subscription_creation_date', this.subscription_creation_date)
        // }
        // RETURN THE CURRENT DAY AT THE TIME 00:00:00
        const today = moment().startOf('day')

        // RETURN THE CURRENT DAY AT THE CURRENT TIME
        // const today = moment();
        // 2019-09-20T08:48:07.000Z
        const current_sub_end_date = moment(this.subscription_end_date)
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data ', today);
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data current_sub_end_date ', current_sub_end_date);

        this.days_to_next_renew = current_sub_end_date.diff(today, 'days');
        this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data days_to_next_renew ', this.days_to_next_renew);

        if (this.days_to_next_renew === 0) {

          this.timeOfNextRenew = moment(current_sub_end_date).format('HH.mm')
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan project Profile Data timeOfNextRenew ', this.timeOfNextRenew);
        }

        // USE CASE 'BUFFER DAYS': WHEN THE SUBSCRIPTION IS EXPIRED WE ADD 3 DAYS TO THE SUB END DATE
        // WHEN days_to_next_renew IS = -3 OR > 3 THE SUBSCRIPTION IS NOT ACTIVE
        // WHEN days_to_next_renew IS = 0 THE SUBSCRIPTION IS ACTIVE
        // WHEN days_to_next_renew IS = -1 OR = -2 THE STRIPE SUBCRIPTION IS EXPIRED BUT WE NOT STILL LOCKED THE PRO FEATURE
        if (this.days_to_next_renew === -1 || this.days_to_next_renew === -2) {

          this.SUBSCRIPTION_BUFFER_DAYS = true;
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        } else {
          this.SUBSCRIPTION_BUFFER_DAYS = false;
          this.logger.log('[PRJCT-EDIT-ADD] - getProjectPlan days_to_next_renew ', this.days_to_next_renew, ' SUBSCRIPTION_BUFFER_DAYS ', this.SUBSCRIPTION_BUFFER_DAYS);
        }

        if (this.prjct_profile_type === 'free') {
          if (this.prjct_trial_expired === false) {
            this.getProPlanTrialTranslation()
            // this.prjct_profile_name = 'Pro (free trial 30gg)'
          } else {
            this.getPaidPlanTranslation(projectProfileData.profile_name)
            // this.prjct_profile_name = projectProfileData.profile_name;
          }
        } else if (this.prjct_profile_type === 'payment') {
          this.getPaidPlanTranslation(projectProfileData.profile_name)
          // this.prjct_profile_name = projectProfileData.profile_name;
        }


        if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === true || this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.DISPLAY_ADVANCED_TAB = false;
        } else if (this.prjct_profile_type === 'free' && this.prjct_trial_expired === false || this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
          this.DISPLAY_ADVANCED_TAB = true;
        }

        // ------------------------------------------------------------------------------------------------------------------------------------------------
        // If the subscription id is present in the project profile, the methods getSubscriptionPayments() getCustomerAndPaymentMethods() and  are executed
        // ------------------------------------------------------------------------------------------------------------------------------------------------
        if (projectProfileData.subscription_id) {
          this.subscription_id = projectProfileData.subscription_id;
          this.logger.log('[PRJCT-EDIT-ADD] this.subscription_id ', this.subscription_id)
          this.getSubscriptionPayments(projectProfileData.subscription_id);
          this.getCustomerAndPaymentMethods()
          // this.getSubscriptionByID(projectProfileData.subscription_id);
        }
      }
    }, error => {

      this.logger.error('[PRICING - PAYMENT-LIST] - getProjectPlan - ERROR', error);
    }, () => {

      this.logger.log('[PRICING - PAYMENT-LIST] - getProjectPlan * COMPLETE *')

    });
  }


  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial')
      .subscribe((translation: any) => {
        this.prjct_profile_name = translation;
      });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }



  openModalSubsExpired() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        if (this.profile_name !== 'enterprise') {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        } else {
          if (this.profile_name === 'enterprise') {

            this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
          }
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }



  // GET THE SUBSCRIPTION PAYMENT SAVED IN OUR DB
  getSubscriptionPayments(subscription_id) {
    this.projectService.getSubscriptionPayments(subscription_id).subscribe((subscriptionPayments: any) => {
      console.log('[PRJCT-EDIT-ADD] GET subscriptionPayments ', subscriptionPayments);

      this.subscriptionPaymentsLength = subscriptionPayments.length
      this.logger.log('[PRJCT-EDIT-ADD] GET subscriptionPayments Length ', this.subscriptionPaymentsLength);
      if (subscriptionPayments) {
        this.subscription_payments = [];
        subscriptionPayments.forEach((subscriptionPayment, index) => {
          this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment.stripe_event ', subscriptionPayment.stripe_event);

          if (subscriptionPayment.stripe_event === 'invoice.payment_succeeded') {

            /**
             **! *** GET THE subscription_creation_date FROM THE SUBSCRIPTION PAYMENT OBJECT OF TYPE invoice.payment_succeeded ***
             *  AND billing_reason === 'subscription_create'
             */
            if (subscriptionPayment.object.data.object.billing_reason === 'subscription_create') {
              this.subscription_creation_date = subscriptionPayment.object.data.object.lines.data[0].period.start
              this.logger.log('[PRJCT-EDIT-ADD] - subscription creation date ', this.subscription_creation_date);
            }

            // get the last iteration in a _.forEach() loop

            this.plan_amount = subscriptionPayment.object.data.object.lines.data[0].plan.amount;
            this.logger.log('[PRJCT-EDIT-ADD] - plan_amount ', this.plan_amount);

            this.plan_interval = subscriptionPayment.object.data.object.lines.data[0].plan.interval;
            this.logger.log('[PRJCT-EDIT-ADD] - plan_interval ', this.plan_interval);

            // if (index === subscriptionPayments.length - 1) {

            //   this.logger.log('last invoice ', subscriptionPayment);
            //   this.current_invoice_start_date = subscriptionPayment.object.data.object.lines.data[0].period.start
            //   this.current_invoice_end_date = subscriptionPayment.object.data.object.lines.data[0].period.end

            // }

            const plan_description = subscriptionPayment.object.data.object.lines.data[0].description;
            this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment plan_description: ', plan_description);
            if (plan_description.indexOf('×') !== -1) {
              const planSubstring = plan_description.split('×').pop();
              this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planSubstring: ', planSubstring);
              if (plan_description.indexOf('(') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('('));
                this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planName: ', planName);
                subscriptionPayment.plan_name = planName.trim()
              }

              if (plan_description.indexOf('after') !== -1) {
                const planName = planSubstring.substring(0, planSubstring.indexOf('after'));
                this.logger.log('[PRJCT-EDIT-ADD] subscriptionPayment planName: ', planName);

                subscriptionPayment.plan_name = planName.trim()
              }
            } else {
              subscriptionPayment.plan_name = plan_description
            }
            this.subscription_payments.push(subscriptionPayment);
          }

        });
        this.logger.log('[PRJCT-EDIT-ADD] FILTERED subscriptionPayments ', this.subscription_payments);
      }
    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET subscriptionPayments error ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET subscriptionPayments * COMPLETE * ');
      this.showSpinner = false;
    });
  }
  // cus_JvdAzyrsRuRnA0
  getCustomerAndPaymentMethods() {
    this.projectService.getStripeCustomer().subscribe((customer: any) => {
      console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer ', customer);
      if (customer) {
        this.customer_id = customer.id
        console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer id', this.customer_id);
        if (customer.invoice_settings && customer.invoice_settings.default_payment_method !== null) {
          this.customer_default_payment_method_id = customer.invoice_settings.default_payment_method
          console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer_default_payment_method_id (from invoice_settings > default_payment_method)', this.customer_default_payment_method_id);
        } else {
          console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer_default_payment_method_id (from invoice_settings > default_payment_method) 2', this.customer_default_payment_method_id);
          console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer_default_payment_method_id (from customer > default_source) 2', customer.default_source);
          this.customer_default_payment_method_id = customer.default_source
        }
        console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION -  this.customer_default_payment_method_id', this.customer_default_payment_method_id);
        if (customer.paymentMethods) {
          // console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer >  paymentMethods ', customer.paymentMethods.data);
          customer.paymentMethods.data.forEach(paymentmethod => {
            console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer >  paymentMethod ', paymentmethod);
            if (this.customer_default_payment_method_id !== null && this.customer_default_payment_method_id === paymentmethod.id) {
              console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer > default paymentMethod ', paymentmethod);
              if (paymentmethod.card) {
                console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer > default paymentMethod CARD', paymentmethod.card);
                this.default_card_brand_name = paymentmethod.card.brand;
                this.card_last_four_digits = paymentmethod.card.last4;
              }
            } else if (this.customer_default_payment_method_id === null) {
              if (paymentmethod.card) {
                console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER & PAYMENT SUBSCRIPTION - customer > NO default paymentMethod OT deafult source - CARD', paymentmethod.card);
                this.default_card_brand_name = paymentmethod.card.brand;
                this.card_last_four_digits = paymentmethod.card.last4;
              }
            }

          });
        }
      }
    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER error ', error);

    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER * COMPLETE * ');

    });
  }


  closePaymentMethodModal() {
    this.displayAddPaymentMethodModal = 'none'
  }

  openModalAddPaymentMethod() {
    this.displayAddPaymentMethodModal = 'block'

    this.DISPLAY_ADD_CARD_COMPLETED = false;
    this.logger.log('openModalAddPaymentMethod DISPLAY_ADD_CARD_COMPLETED ', this.DISPLAY_ADD_CARD_COMPLETED)
    this.CARD_HAS_ERROR = null;
    this.SPINNER_IN_ADD_CARD_MODAL = null;
    this.form.reset()

    if (this.ccNumberField) {
      const creditCardInput = this.ccNumberField.nativeElement;
      // console.log('openModalAddPaymentMethod creditCardInput ', creditCardInput) 
      setTimeout(() => {
        creditCardInput.focus()
      }, 200);
    }
  }

  // https://stackoverflow.com/questions/50416301/angular-how-to-do-credit-card-input
  creditCardNumberSpacing() {
    const input = this.ccNumberField.nativeElement;
    const { selectionStart } = input;
    const { creditCard } = this.form.controls;
    this.logger.log('creditCardNumberSpacing creditCard value ', creditCard.value)
    if (creditCard.value) {
      let trimmedCardNum = creditCard.value.replace(/\s+/g, '');

      if (trimmedCardNum.length > 16) {
        trimmedCardNum = trimmedCardNum.substr(0, 16);
      }

      /* Handle American Express 4-6-5 spacing */
      const partitions = trimmedCardNum.startsWith('34') || trimmedCardNum.startsWith('37')
        ? [4, 6, 5]
        : [4, 4, 4, 4];

      const numbers = [];
      let position = 0;
      partitions.forEach(partition => {
        const part = trimmedCardNum.substr(position, partition);
        if (part) numbers.push(part);
        position += partition;
      })

      creditCard.setValue(numbers.join(' '));

      /* Handle caret position if user edits the number later */
      if (selectionStart < creditCard.value.length - 1) {
        input.setSelectionRange(selectionStart, selectionStart, 'none');
      }

      this.card_brand = this.creditCardTypeFromNumber(creditCard.value);
      this.logger.log('card_brand ', this.card_brand)
      if (this.card_brand === 'amex') {
        this.CVC_LENGHT = 4
      } else[
        this.CVC_LENGHT = 3
      ]
    }

    // this.creditCardNumberSpacing()
  }
  // https://stackoverflow.com/questions/30008556/regex-and-keyup-for-credit-card-detection
  // https://gist.github.com/michaelkeevildown/9096cd3aac9029c4e6e05588448a8841 (list of credit card regex)
  creditCardTypeFromNumber(num) {
    // Sanitise number  
    this.logger.log('creditCardTypeFromNumber num ', num)
    num = num.replace(/[^\d]/g, '');

    var regexps = {
      'mastercard': /^5[1-5][0-9]{5,}$/,
      'visa': /^4[0-9]{6,}$/,
      'amex': /^3[47][0-9]{5,}$/,
      'discover': /^6(?:011|5[0-9]{2})[0-9]{3,}$/,
      'diners': /^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/,
      'jcb': /^(?:2131|1800|35[0-9]{3})[0-9]{3,}$/,
      'unionpay': /^(62[0-9]{14,17})$/,
      'unknown': /.*/,
    };

    for (var card in regexps) {
      if (num.match(regexps[card])) {
        this.logger.log(card);
        return card;
      }
    }
  }

  onPasteCreditCardNumber(event: ClipboardEvent) {
    const input = this.ccNumberField.nativeElement;
    const { selectionStart } = input;
    const { creditCard } = this.form.controls;
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    this.logger.log('onPasteCreditCardNumber pastedText', pastedText)
    this.ccExpdateField.nativeElement.focus()
  }


  onSubmit(form) {
    this.submitted = true;
    this.logger.log('onSubmit form', form);
    if (form.expirationDate !== '') {
      const expirationDateSegment = form.expirationDate.split('/');
      this.logger.log('onSubmit expirationDateSegment', expirationDateSegment);
      const expirationDateMonth = expirationDateSegment[0].trim()
      const expirationDateYear = expirationDateSegment[1].trim()
      const creditcardnum = form.creditCard.replace(/\s/g, '')
      this.logger.log('onSubmit creditCard NUM', creditcardnum);

      this.logger.log('onSubmit expirationDateMonth', expirationDateMonth);
      this.logger.log('onSubmit expirationDateYear', expirationDateYear);
      const creditcardcvc = form.cvc
      this.logger.log('onSubmit cvc', creditcardcvc);


      this.updateCustomer(creditcardnum, expirationDateMonth, expirationDateYear, creditcardcvc)
    }
  }

  updateCustomer(creditcardnum: string, expirationDateMonth: string, expirationDateYear: string, creditcardcvc: string) {
    this.SPINNER_IN_ADD_CARD_MODAL = true;
    this.CARD_HAS_ERROR = null
    this.projectService.updateStripeCustomer(this.customer_id, creditcardnum, expirationDateMonth, expirationDateYear, creditcardcvc).subscribe((updatedcustomer: any) => {
      console.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER - customer ', updatedcustomer);
      // if (updatedcustomer) {

      //   console.log('[PRJCT-EDIT-ADD] - UPDATE - customer_id ', this.customer_id);
      // }

    }, (error) => {
      // console.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error ', error);  
      // console.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error _body', error._body);

      const error_body = JSON.parse(error._body)
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER error_body ', error_body);
      this.credit_card_error_msg = error_body.msg.raw.message;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER credit_card_error_msg ', this.credit_card_error_msg);
      this.CARD_HAS_ERROR = true;
      this.SPINNER_IN_ADD_CARD_MODAL = false
      this.DISPLAY_ADD_CARD_COMPLETED = false
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATED CUSTOMER * COMPLETE * ');
      this.CARD_HAS_ERROR = false;
      this.SPINNER_IN_ADD_CARD_MODAL = false
      this.DISPLAY_ADD_CARD_COMPLETED = true
      setTimeout(() => {
        this.getCustomerAndPaymentMethods();
      }, 0);
      this.getCustomerPaymentMethodsListAndDeleteNotDefault()
    });
  }

  getCustomerPaymentMethodsListAndDeleteNotDefault() {
    this.projectService.getCustomerPaymentMethodsList(this.customer_id).subscribe((paymentMethodsList: any) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST paymentMethodsList ', paymentMethodsList);

    }, (error) => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST * ERROR *', error);

    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PAYMENT METHODS LIST * COMPLETE *');
    });

  }



  // createCardToken() {
  //   this.projectService.createCardToken().subscribe((token: any) => {
  //     console.log('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN - token ', token);
  //     if (token) {
  //       this.card_id = token.card.id
  //       console.log('[PRJCT-EDIT-ADD] -  CREATE CARD TOKEN card_id ', this.card_id);
  //     }

  //   }, (error) => {
  //     this.logger.error('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN error ', error);

  //   }, () => {
  //     console.log('[PRJCT-EDIT-ADD] - CREATE CARD TOKEN * COMPLETE * ');

  //   });
  // }

  // createCustomerPortal() {
  //   this.projectService.createCustomerPortal().subscribe((customer: any) => {
  //     console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER - customer ', customer);
  //     // if (customer ) {
  //     //   const customerId = 
  //     // }

  //   }, (error) => {
  //     this.logger.error('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER error ', error);

  //   }, () => {
  //     console.log('[PRJCT-EDIT-ADD] - GET STRIPE CUSTOMER * COMPLETE * ');

  //   });
  // }

  /**
   * *** CANCEL SUBSCRIPTION ***
   * * the callback cancelSubscription() IS RUNNED in NotificationMessageComponent when the user click on
   *   the modal button Cancel Subscription
   * * NotificationMessageComponent, through the notify service, publishes the progress status
   *   of the cancellation of the subscription
   * * the NavbarComponent is subscribed to cancelSubscriptionCompleted$ and, when hasDone === true,
   *   call prjctPlanService.getProjectByID() that get and publish (with prjctPlanService.projectPlan$) the updated project object
   * * this component is a subscriber of prjctPlanService.projectPlan$ so the UI is refreshed when the prjctPlanService publish projectPlan$
   */

  listenCancelSubscription() {
    this.notify.cancelSubscriptionCompleted$.subscribe((hasDone: boolean) => {

      this.logger.log('[PRJCT-EDIT-ADD] - (listenCancelSubscription) cancelSubscriptionCompleted hasDone', hasDone);
      if (hasDone === false) {
        this.showSpinner = true;
      }

      if (hasDone === true) {
        this.showSpinner = false;
        // this.prjct_profile_type = 'free'
      }
    });
  }

  // doCancelSubcription() {
  //   this.showSpinner = true;
  //   this.projectService.cancelSubscription().subscribe((confirmation: any) => {
  //     this.logger.log('cancelSubscription RES ', confirmation);

  //     if (confirmation && confirmation.status === 'canceled') {
  //       this.notify.showNotification(this.subscriptionCanceledSuccessfully, 2, 'done');

  //       // this.ngOnInit()
  //       this.prjct_profile_type = 'free'
  //       this.cancelSubscriptionDone = true;
  //       this.logger.log('ProjectEditAddComponent cancelSubscriptionDone ', this.cancelSubscriptionDone);
  //       // setTimeout(() => {
  //       // }, 2000);
  //     }
  //   }, error => {
  //     this.logger.log('cancelSubscription - ERROR: ', error);
  //     this.notify.showNotification(this.subscriptionCanceledError, 4, 'report_problem');
  //     this.showSpinner = false;
  //   }, () => {
  //     this.logger.log('cancelSubscription * COMPLETE *');
  //     this.showSpinner = false;
  //   });
  // }

  goToPayments() {
    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.id_project + '/payments']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  // openLetsChatModal() {
  //   this.displayContactUsModal = 'block';
  //   this.logger.log('openLetsChatModal')
  // }
  getMoreOperatorsSeats() {
    if (this.USER_ROLE === 'owner') {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
  }

  launchWidget() {
    // if (window && window['tiledesk']) {
    //   window['tiledesk'].open();
    // }

    window.open('mailto:' + this.contactUsEmail, 'mail')
  }

  goToPricing() {
    if (this.isVisiblePaymentTab) {
      if (this.USER_ROLE === 'owner') {
        this.router.navigate(['project/' + this.id_project + '/pricing']);
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }



  // !!! NO MORE USED - GO BACK TO PROJECT LIST
  goBackToProjectsList() {
    this.router.navigate(['/projects']);
  }

  goBack() {
    this._location.back();
  }

  getProjectId() {
    this.id_project = this.route.snapshot.params['projectid'];
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT COMPONENT HAS PASSED id_project ', this.id_project);
    if (this.id_project) {
      this.getProjectById();
    }

  }

  /**
   * *** GET PROJECT OBJECT BY ID (EDIT VIEW) ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   */
  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // console.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      if (project) {
        this.projectName_toUpdate = project.name;
        this.logger.log('[PRJCT-EDIT-ADD] - PROJECT NAME TO UPDATE: ', this.projectName_toUpdate);

        if (project.ipFilter) {
          let IP_filterArrayToString = project.ipFilter.toString()
          // console.log('[PRJCT-EDIT-ADD] - IP FILTER ARRAY : ', IP_filterArrayToString);
          let IP_filterArrayToStringSpaced = IP_filterArrayToString.replace(/,/g, ', ');
          // console.log('[PRJCT-EDIT-ADD] - IP FILTER ARRAY : ', IP_filterArrayToStringSpaced);
          this.allowedIPs = IP_filterArrayToStringSpaced
        }

        if (project.ipFilterEnabled) {
          this.ip_restrictions_on = project.ipFilterEnabled
        }
        // used in onProjectNameChange to enable / disable the 'update project name' btn
        this.project_name = project.name;

        if (project.settings) {

          if (project.settings.email) {

            if (project.settings.email.autoSendTranscriptToRequester === true) {
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ', project.settings.email.autoSendTranscriptToRequester);

              this.AUTO_SEND_TRANSCRIPT_IS_ON = true;
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);

            } else {
              this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
              this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
            }

            // Check Notification Status - START
            if (project.settings.email.notification) {
              if (project.settings.email.notification.conversation) {

                if (project.settings.email.notification.conversation.assigned === true) {
                  this.assigned_conv_on = true;
                } else {
                  this.assigned_conv_on = false;
                }

                if (project.settings.email.notification.conversation.pooled === true) {
                  this.unassigned_conv_on = true;
                } else {
                  this.unassigned_conv_on = false;
                }

              }
            } else {
              this.assigned_conv_on = true;
              this.unassigned_conv_on = true;
            }
            // END

          } else {

            this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
            this.assigned_conv_on = true;
            this.unassigned_conv_on = true;
            this.logger.log('[PRJCT-EDIT-ADD]- ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
          }


        } else {
          this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
          this.assigned_conv_on = true;
          this.unassigned_conv_on = true;
          this.logger.log('[PRJCT-EDIT-ADD] - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
        }


        // ------------------------------------------------------------
        // Advanced section properties
        // ------------------------------------------------------------

        // chat_limit_on: boolean;
        // reassignment_on: boolean;
        // automatic_unavailable_status_on: boolean;

        //       is_disabled_chat_limit_section: boolean;
        // is_disabled_reassignment_section: boolean;
        // is_disabled_unavailable_status_section: boolean;

        if (project.settings) {
          // Chat limit
          if (project.settings.max_agent_assigned_chat) {
            this.max_agent_assigned_chat = project.settings.max_agent_assigned_chat
          } else {
            this.max_agent_assigned_chat = 3
          }

          if (project.settings.chat_limit_on) {
            this.chat_limit_on = project.settings.chat_limit_on;
          } else {
            this.chat_limit_on = false;
          }

          // Reassignment
          if (project.settings.reassignment_delay) {
            this.reassignment_delay = project.settings.reassignment_delay
          } else {
            this.reassignment_delay = 300;
          }

          if (project.settings.reassignment_on) {
            this.reassignment_on = project.settings.reassignment_on
          } else {
            this.reassignment_on = false;
          }

          // Automatic unavailable status
          if (project.settings.automatic_idle_chats) {
            this.automatic_idle_chats = project.settings.automatic_idle_chats
          } else {
            this.automatic_idle_chats = 3;
          }

          if (project.settings.automatic_unavailable_status_on) {
            this.automatic_unavailable_status_on = project.settings.automatic_unavailable_status_on
          } else {
            this.automatic_unavailable_status_on = false;
          }


        } else {
          this.max_agent_assigned_chat = 3;
          this.reassignment_delay = 300;
          this.automatic_idle_chats = 3;
          this.chat_limit_on = false;
          this.reassignment_on = false;
          this.automatic_unavailable_status_on = false;;
        }
      }

    }, (error) => {
      this.logger.error('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - GET PROJECT BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }


  toggleChat_limit_on($event) {
    if ($event.target.checked) {

      this.chat_limit_on = true;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleChat_limit_on ', this.chat_limit_on);
    } else {

      this.chat_limit_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleChat_limit_on ', this.chat_limit_on);
    }

  }

  toggleReassignment_on($event) {

    if ($event.target.checked) {

      this.reassignment_on = true;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleReassignment_on ', this.reassignment_on);
    } else {

      this.reassignment_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleReassignment_on ', this.reassignment_on);
    }

  }

  toggleUnavailable_status_on($event) {

    if ($event.target.checked) {

      this.automatic_unavailable_status_on = true;
      this.logger.log('[PRJCT-EDIT-ADD]- toggleUnavailable_status_on ', this.automatic_unavailable_status_on);
    } else {

      this.automatic_unavailable_status_on = false;
      this.logger.log('[PRJCT-EDIT-ADD] - toggleUnavailable_status_on ', this.automatic_unavailable_status_on);
    }

  }

  toggleProjectAssignedConversation($event) {
    this.logger.log("[PRJCT-EDIT-ADD] - Event Toggle Assigned: ", $event.target.checked);
    this.assigned_conv_on = $event.target.checked;

    this.projectService.enableDisableAssignedNotification(this.assigned_conv_on).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] - ENABLE/DISABLED ASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      this.logger.error("[PRJCT-EDIT-ADD] - Error during ENABLE/DISABLED ASSIGNED NOTIFICATION updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleProjectUnassignedConversation($event) {
    this.logger.log("[PRJCT-EDIT-ADD] - Event Toggle UNASSIGNED: ", $event.target.checked);
    this.unassigned_conv_on = $event.target.checked;

    this.projectService.enableDisableUnassignedNotification(this.unassigned_conv_on).then((result) => {
      this.logger.log("[PRJCT-EDIT-ADD] ENABLE/DISABLED UNASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      this.logger.error("PRJCT-EDIT-ADD] Error during  ENABLE/DISABLED UNASSIGNED NOTIFICATION updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleEnableIPrestrictions($event) {
    this.ip_restrictions_on = $event.target.checked;
  }

  allowedIPsChanged($event) {
    // console.log("[PRJCT-EDIT-ADD] allowedIPsChanged $event ", $event)
  }

  saveIPranges() {
    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - id_project", this.id_project)
    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges", this.allowedIPs)

    this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - ip_restrictions_on", this.ip_restrictions_on)
    let allowedIPsArray = []
    if (this.allowedIPs) {
      const allowedIPsTrimmed = this.allowedIPs.replace(/\s/g, '');
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges allowedIPsTrimmed ", allowedIPsTrimmed)
      allowedIPsArray = allowedIPsTrimmed.split(',')
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges split ", allowedIPsArray)
      // if (allowedIPsArray.length === 0) {
      //   console.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPranges is empty ")
      // }
    } else {
      this.logger.log("[PRJCT-EDIT-ADD] SAVE IP RANGES - allowedIPs is empty ")
      this.ip_restrictions_on = false;
    }


    if (this.ip_restrictions_on && allowedIPsArray.length > 0) {
      swal({
        title: "Are you sure?",
        text: "Adding IP-based access restrictions can break Tiledesk access!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willAddIpRanges) => {
          if (willAddIpRanges) {

            this.logger.log('[PRJCT-EDIT-ADD] swal willAddIpRanges', willAddIpRanges)
            // this.id_project,

            this.projectService.addAllowedIPranges(this.id_project, this.ip_restrictions_on, allowedIPsArray).subscribe((res: any) => {
              this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges res ', res)

            }, (error) => {
              this.logger.error('[PRJCT-EDIT-ADD] addAllowedIPranges - ERROR ', error);

              swal("Sorry, an error occurred saving IPs addresses", {
                icon: "error",
              });

            }, () => {
              this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges * COMPLETE *');

              swal("IP addresses successfully added", {
                icon: "success",
              }).then((okpressed) => {

              });

            });


            // swal("Poof! Your imaginary file has been deleted!", {
            //   icon: "success",
            // });
          } else {
            // swal("Your imaginary file is safe!");
          }
        });
    } else if (this.ip_restrictions_on === false || allowedIPsArray.length === 0) {

      this.projectService.addAllowedIPranges(this.id_project, this.ip_restrictions_on, allowedIPsArray).subscribe((res: any) => {
        this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges res ', res)

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] addAllowedIPranges - ERROR ', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] addAllowedIPranges * COMPLETE *');


      });
    }
  }




  onProjectNameChange(event) {
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT NAME CHANGE ', event);
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT NAME TO UPDATE ', this.project_name);

    if (event === this.project_name) {
      this.DISABLE_UPDATE_BTN = true;

    } else {
      this.DISABLE_UPDATE_BTN = false;
    }
  }



  edit() {
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT ID WHEN EDIT IS PRESSED ', this.id_project);
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT NAME WHEN EDIT IS PRESSED ', this.projectName_toUpdate);

    this.projectService.updateProjectName(this.id_project, this.projectName_toUpdate)
      .subscribe((prjct) => {
        this.logger.log('[PRJCT-EDIT-ADD] - UPDATE PROJECT - RESPONSE ', prjct);

        if (prjct) {
          if (prjct.name === this.projectName_toUpdate) {
            this.DISABLE_UPDATE_BTN = true;
          }

          // WHEN THE USER UPDATE THE PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT RE-PUBLISHES IT
          const project: Project = {
            _id: this.id_project,
            name: prjct.name,
          }
          this.auth.projectSelected(project)

          const storedProjectJson = localStorage.getItem(this.id_project);
          this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT JSON ', storedProjectJson);

          if (storedProjectJson) {
            const projectObject = JSON.parse(storedProjectJson);
            this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ ', projectObject);

            const storedUserRole = projectObject['role'];
            this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - USER ROLE ', storedUserRole);

            const storedProjectName = projectObject['name'];
            this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - PRJ NAME ', storedProjectName);

            const storedProjectId = projectObject['_id'];
            this.logger.log('[PRJCT-EDIT-ADD] - STORED PROJECT OBJ - PRJ ID ', storedProjectId);

            const storedProjectOH = projectObject['operatingHours'];

            if (storedProjectName !== prjct.name) {

              const updatedProjectForStorage: Project = {
                _id: storedProjectId,
                name: prjct.name,
                role: storedUserRole,
                operatingHours: storedProjectOH
              }

              // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED NAME
              localStorage.setItem(storedProjectId, JSON.stringify(updatedProjectForStorage));

            }
          }
        }

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] UPDATE PROJECT - ERROR ', error);

        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);


        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
      });
  }


  autoSendTranscriptOnOff($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - AUTO SEND TRANSCRIPT BY EMAIL ON ', $event.target.checked);

    this.projectService.updateAutoSendTranscriptToRequester($event.target.checked)
      .subscribe((prjct) => {
        this.logger.log('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT - RES ', prjct);
      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] AUTO SEND TRANSCRIPT UPDATE PROJECT * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        // this.router.navigate(['/projects']);
      });
  }

  updateAdvancedSettings() {
    const updateAdvancedSettingBtn = <HTMLElement>document.querySelector('.btn_edit_advanced_settings');
    this.logger.log('[PRJCT-EDIT-ADD]  - UPDATE ADVANCED SETTINGS BTN ', updateAdvancedSettingBtn)
    updateAdvancedSettingBtn.blur();
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - max_agent_assigned_chat ', this.max_agent_assigned_chat, ' reassignment_delay ', this.reassignment_delay, ' automatic_idle_chats ', this.automatic_idle_chats);

    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - chat_limit_on ', this.chat_limit_on, ' reassignment_on ', this.reassignment_on, ' automatic_unavailable_status_on ', this.automatic_unavailable_status_on);


    // if (this.chat_limit_on === true || this.reassignment_on === true || this.automatic_unavailable_status_on === true) {
    this.projectService.updateAdvancedSettings(this.max_agent_assigned_chat, this.reassignment_delay, this.automatic_idle_chats, this.chat_limit_on, this.reassignment_on, this.automatic_unavailable_status_on)
      .subscribe((prjct) => {
        this.logger.log('[PRJCT-EDIT-ADD] UPDATE ADVANCED SETTINGS - RES ', prjct);

        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
        // I call "this.auth.projectSelected" so that the project is republished and can have the updated data of the advanced options (smart assign) in the conversation list
        // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
        const _project: Project = {
          _id: prjct['_id'],
          name: prjct['name'],
          profile_name: prjct['profile'].name,
          trial_expired: prjct['trialExpired'],
          trial_days_left: prjct['trialDaysLeft'],
          operatingHours: prjct['activeOperatingHours']
        }

        this.auth.projectSelected(_project)


      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
      })
    // } else {

    //   this.notify.showWidgetStyleUpdateNotification(this.notificationNothingToSave, 3, 'report_problem');
    // }
  }


  onChangeMaximum_chats($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT  ', $event);

    if ($event < 1) {
      this.maximum_chats_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT - HAS MIN ERROR ', this.maximum_chats_has_minimum_error);
    } else {
      this.maximum_chats_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.maximum_chats_has_maximum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE MAXIMUM CHAT - HAS MAX ERROR ', this.maximum_chats_has_maximum_error);
    } else {
      this.maximum_chats_has_maximum_error = false;
    }
  }

  onChangeReassignment_timeout($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT ', $event);

    if ($event < 1) {
      this.reassignment_timeout_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MIN ERROR ', this.reassignment_timeout_has_minimum_error);
    } else {
      this.reassignment_timeout_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.reassignment_timeout_has_maximum__error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MAX ERROR ', this.reassignment_timeout_has_maximum__error);
    } else {
      this.reassignment_timeout_has_maximum__error = false;
    }

  }

  onChangeAutomaticUnavailable($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE Automatic Unavailable after a n of chat ', $event);

    if ($event < 1) {
      this.automatic_idle_chats_has_minimum_error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MIN ERROR ', this.reassignment_timeout_has_minimum_error);
    } else {
      this.automatic_idle_chats_has_minimum_error = false;
    }

    if ($event > 10000000) {
      this.automatic_idle_chats_has_maximum__error = true;
      this.logger.log('[PRJCT-EDIT-ADD] - UPDATE ADVANCED SETTINGS - ON CHANGE REASSIGMENT TIMEOUT - HAS MAX ERROR ', this.reassignment_timeout_has_maximum__error);
    } else {
      this.automatic_idle_chats_has_maximum__error = false;
    }

  }

  openConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'block';
  }

  closeConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'none';
  }

  generateSharedSecret() {
    this.displayConfirmJwtSecretCreationModal = 'none';
    this.projectService.generateSharedSecret()
      .subscribe((res) => {
        this.logger.log('[PRJCT-EDIT-ADD] - GENERATE SHARED SECRET - RESPONSE ', res);
        this.sharedSecret = res.jwtSecret

      }, (error) => {
        this.logger.error('[PRJCT-EDIT-ADD] GENERATE SHARED SECRET - ERROR ', error);
      }, () => {
        this.logger.log('[PRJCT-EDIT-ADD] GENERATE SHARED SECRET  * COMPLETE *');

        this.displayJwtSecretGeneratedModal = 'block'
      });
  }

  closeJwtSecretGeneratedModal() {
    this.displayJwtSecretGeneratedModal = 'none'
  }

  copySharedSecret() {
    const copyText = document.getElementById('sharedSecretInput') as HTMLInputElement;
    copyText.select();
    document.execCommand('copy');
  }

  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  openDeleteModal() {
    this.logger.log('[PRJCT-EDIT-ADD] - OPEN DELETE MODAL -> PROJECT ID ', this.id_project);
    if (this.USER_ROLE === 'owner') {
      this.display = 'block';
    } else {
      this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyATeammateWithTheOwnerRoleCanDeleteAProject_lbl, this.learnMoreAboutDefaultRoles)
    }

    if (this.USER_ROLE === 'owner' && this.prjct_profile_type === 'payment') {
      this.isActiveSubscription = true
    }
  }

  onCloseModal() {
    this.display = 'none';
  }

  onProjectIdToDeleteChange($event) {
    this.logger.log('[PRJCT-EDIT-ADD] - ON PROJECT ID CHANGE ', $event);
    this.logger.log('[PRJCT-EDIT-ADD] - PROJECT ID  ', this.id_project);

    if ($event === this.id_project) {
      this.DISABLE_DELETE_PROJECT_BTN = false;

    } else {
      this.DISABLE_DELETE_PROJECT_BTN = true;
    }
  }

  deleteProject() {
    // if (this.prjct_profile_type !== 'payment') {
    this.SHOW_CIRCULAR_SPINNER = true;
    this.logger.log('[PRJCT-EDIT-ADD] - deleteProject ID PROJECT TO DELETE ', this.project_id_to_delete);
    this.logger.log('[PRJCT-EDIT-ADD] - deleteProject ID PROJECT ', this.id_project);

    this.projectService.deleteProject(this.id_project).subscribe((data) => {
      this.logger.log('[PRJCT-EDIT-ADD] - deleteProject RES ', data);

    }, (error) => {
      this.SHOW_CIRCULAR_SPINNER = false;
      this.logger.error('[PRJCT-EDIT-ADD] - deleteProject - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[PRJCT-EDIT-ADD] - deleteProject * COMPLETE *');

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false;
        this.notify.showNotificationChangeProject(this.deleteSuccessMsg, 2, 'done');
        this.router.navigate(['/projects']);
      }, 1500);
    });
    // } else {
    //   console.log('[PRJCT-EDIT-ADD] - deleteProject > project profile type' , this.prjct_profile_type );
    // }
  }



  goToWidgetAuthenticationDocs() {
    const url = 'https://developer.tiledesk.com/widget/auth'
    window.open(url, '_blank');
  }

  goToWebhookDocs() {
    const url = 'https://developer.tiledesk.com/apis/webhooks'
    window.open(url, '_blank');
  }

  goToKBDocsSettingUpAutomaticAssignment() {
    const url = URL_setting_up_automatic_assignment
    window.open(url, '_blank');
  }

  goToWebhookPage() {
    this.logger.log("[PRJCT-EDIT-ADD] Navigate to Webhook with the ProjectID: ", this.id_project);
    this.router.navigate(['project/' + this.id_project + '/webhook']);
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);

    this.TEST_WIDGET_API_BASE_URL = this.TESTSITE_BASE_URL.replace('index.html', "index-dev.html")
    this.logger.log('[PRJCT-EDIT-ADD] getAppConfig TEST_WIDGET_API_BASE_URL', this.TEST_WIDGET_API_BASE_URL);
  }

  goToWidgetTestPage() {
    const widgetTestPageBtnElem = <HTMLElement>document.querySelector('.test-widget-api-btn');
    widgetTestPageBtnElem.blur();

    const url = this.TEST_WIDGET_API_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + this.projectName + '&isOpen=true'
    window.open(url, '_blank');
  }

  viewCancelSubscription() {
    this.notify.displayCancelSubscriptionModal(true);
  }

}
