import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ConsentForm } from "../../models/consentForm";
import { ClientService } from "../../services/client.service";
import { AuthService } from '../../services/authentication.service';
declare var swal: any;

@Component({
    selector: 'consentForm',
    templateUrl: './app/components/consent-form/consent-form.component.html',
    styleUrls: ['./app/components/consent-form/consent-form.component.css']
})


export class ConsentFormComponent {
  @Input() consentForm: ConsentForm;
  error: any;
  date: any;
  clientName: string = '';
  completeConsentForm: boolean;
  currentUser: any;
  otherChecked: boolean = false;
  loading: boolean = true;

  constructor(private clientService: ClientService, private router: Router, private authService: AuthService) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      var userID = this.currentUser.userID;
      this.date = new Date();
      this.consentForm = new ConsentForm();

      if (this.currentUser.userType !== "Client") {
        this.completeConsentForm = true;
        this.loading = false;
        swal(
            'Read Only',
            "You are logged in as '" + this.currentUser.userType + "'. Only clients can submit this form.",
            'warning'
        );
      } else {
        this.clientService
        .getClient(userID)
        .then(result => {
          this.clientName = result.client[0].firstName + " " + result.client[0].lastName;
          this.completeConsentForm = result.client[0].consent;
          if (!result.client[0].consent) {
            this.clientService
            .getConsentById()
            .then(result => {
              this.consentForm = result[0];
              this.loading = false;
              swal(
                  'Read Only',
                  "You have already submitted this form. Select 'Request to Edit' if you would like to make changes.",
                  'warning'
              );
              console.log(this.completeConsentForm);
            })
            .catch(err => {
              console.log(err);
            });
            if (this.consentForm.other == null || this.consentForm.other === '') {
              this.otherChecked = false;
            } else {
              this.otherChecked = true;
            }
          } else {
            this.consentForm.ontarioWorks = false;
            this.consentForm.ontarioDisabilityProgram = false;
            this.consentForm.employmentInsurance = false;
            this.consentForm.employmentServices = false;
            this.consentForm.wsib = false;
            this.loading = false;
          }
        })
        .catch(err => {
          console.log(err);
        });
      }
  }

  saveConsent() {
    // if (!this.consentForm.allowDetailedMessage) {
    //   if (!this.consentForm.alternateNumber) {
    //     swal(
    //         'Whoops!',
    //         'Please enter an alternate phone number.',
    //         'warning'
    //     );
    //   } else {
    //     if (!this.consentForm.contactName || !this.consentForm.contactNum ) {
    //       swal(
    //           'Whoops!',
    //           'Please fill out all form fields.',
    //           'warning'
    //       );
    //     } else {
    //       this.consentForm.date = this.date;
    //       this.clientService
    //           .saveConsent(this.consentForm)
    //           .then(client => {
    //               this.router.navigate(['/dashboard']);
    //           })
    //           .catch(error => this.error = error);
    //     }
    //   }
    // } else {
    //   if (!this.consentForm.contactName || !this.consentForm.contactNum ) {
    //     swal(
    //         'Whoops!',
    //         'Please fill out all form fields.',
    //         'warning'
    //     );
    //   } else {
    //     this.consentForm.date = this.date;
    //     this.clientService
    //         .saveConsent(this.consentForm)
    //         .then(client => {
    //             this.router.navigate(['/dashboard']);
    //         })
    //         .catch(error => this.error = error);
    //   }
    // }
    this.consentForm.date = this.date;
    this.clientService
        .saveConsent(this.consentForm)
        .then(client => {
            this.router.navigate(['/dashboard']);
        })
        .catch(error => this.error = error);
  }

  requestEdit() {

  }

  goBack() {
      window.history.back();
  }

}
