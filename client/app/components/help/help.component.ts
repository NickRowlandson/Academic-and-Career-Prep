import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningStyleForm } from "../../models/learningStyleForm";
import { ClientService } from "../../services/client.service";
import { AuthService } from '../../services/authentication.service';
declare var swal: any;

@Component({
    selector: 'help',
    templateUrl: './app/components/help/help.component.html',
    styleUrls: ['./app/components/help/help.component.css']
})

export class HelpComponent {
  public home: boolean = true;
  public login: boolean = false;
  public resetPass: boolean = false;
  public newClient: boolean = false;
  public manageClients: boolean = false;
  public createStudent: boolean = false;
  public manageStudents: boolean = false;
  public newCourse: boolean = false;
  public manageCourses: boolean = false;
  public assignStudentCourse: boolean = false;
  public caseNotes: boolean = false;
  public timetable: boolean = false;
  public consent: boolean = false;
  public learningStyle: boolean = false;
  public attendanceReport: boolean = false;
  public attendanceTaking: boolean = false;
  public manageStaff: boolean = false;

  constructor(private clientService: ClientService, private router: Router, private authService: AuthService) {

  }

  open(page) {
    this.home = false;
    this.login = false;
    this.resetPass = false;
    this.newClient = false;
    this.manageClients = false;
    this.createStudent = false;
    this.manageStudents = false;
    this.newCourse = false;
    this.manageCourses = false;
    this.manageStaff = false;
    this.assignStudentCourse = false;
    this.caseNotes = false;
    this.timetable = false;
    this.consent = false;
    this.learningStyle = false;
    this.attendanceReport = false;
    this.attendanceTaking = false;
    console.log(page);
    if (page === 'home') {
      this.home = true;
    } else if (page === 'login') {
      this.login = true;
    } else if (page === 'resetPass') {
      this.resetPass = true;
    } else if (page === 'newClient') {
      this.newClient = true;
    } else if (page === 'manageClients') {
      this.manageClients = true;
    } else if (page === 'createStudent') {
      this.createStudent = true;
    } else if (page === 'manageStudents') {
      this.manageStudents = true;
    } else if (page === 'manageStaff') {
      this.manageStaff = true;
    } else if (page === 'newCourse') {
      this.newCourse = true;
    } else if (page === 'manageCourses') {
      this.manageCourses = true;
    } else if (page === 'assignStudentCourse') {
      this.assignStudentCourse = true;
    } else if (page === 'caseNotes') {
      this.caseNotes = true;
    } else if (page === 'timetable') {
      this.timetable = true;
    } else if (page === 'consent') {
      this.consent = true;
    } else if (page === 'learningStyle') {
      this.learningStyle = true;
    } else if (page === 'attendanceReport') {
      this.attendanceReport = true;
    } else if (page === 'attendanceTaking') {
      this.attendanceTaking = true;
    } else {
      this.home = true;
    }
  }

  goBack() {
      window.history.back();
  }
}
