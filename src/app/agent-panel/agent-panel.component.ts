import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/auth.services';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AgentUser } from './agent-user.model';
import { UserService } from './agent-user.service';
import { Router } from '@angular/router';
//agent raw
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
//raw
interface RentalData {
  date: Date;
  appActivations: number;
  appDeactivations: number;
}
//raw
interface MonthlyRentalSummary {
  agreements: number;
  accumulatedDays: number;
  averageDaysPerAgreement: number;
}


@Component({
  selector: 'app-agent-panel',
  standalone: false,

  templateUrl: './agent-panel.component.html',
  styleUrl: './agent-panel.component.css',
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger('50ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]

})
export class AgentPanelComponent {
  //raw 2 lines
  @ViewChild('rentalChart') rentalChart!: ElementRef;
  chart: Chart | null = null;

  name: string = '';
  lastname:string='';
  phonenumber: string = '';
  email: string = '';
  password: string = '';
  country: string = '';
  city: string = '';

  users: AgentUser[] = [];
  userSubscription: Subscription | null = null;
  showCreateForm: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  showDeleteConfirmation: boolean = false;
userToDelete: string | null = null;
currentView: 'dashboard' | 'users' | 'createUser' = 'dashboard';

//dummy data
rentalData: RentalData[] = [
  { date: new Date('2025-03-01'), appActivations: 7, appDeactivations: 4 },
  { date: new Date('2025-03-02'), appActivations: 6, appDeactivations: 3 },
  { date: new Date('2025-03-03'), appActivations: 8, appDeactivations: 5 },
  { date: new Date('2025-03-04'), appActivations: 9, appDeactivations: 6 },
  { date: new Date('2025-03-05'), appActivations: 7, appDeactivations: 4 },
  { date: new Date('2025-03-06'), appActivations: 6, appDeactivations: 3 },
  { date: new Date('2025-03-07'), appActivations: 5, appDeactivations: 2 }
];

monthlyRentalSummary: MonthlyRentalSummary = {
  agreements: 152,
  accumulatedDays: 912,
  averageDaysPerAgreement: 6
};





  constructor(private userService: UserService, private router: Router) {}
  ngOnInit() {
    this.setCurrentView('dashboard');
    this.loadUsers();
    //raw
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.createRentalChart();
    }, 1000);
  }
  //raw
  ngAfterViewInit() {
    this.createRentalChart();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
//raw
  createRentalChart() {
    if (!this.rentalChart) return;

    const ctx = this.rentalChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.rentalData.map(item => item.date.toLocaleDateString()),
        datasets: [
          {
            label: 'App Activations',
            data: this.rentalData.map(item => item.appActivations),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'App Deactivations',
            data: this.rentalData.map(item => item.appDeactivations),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Weekly Rental Data'
          }
        }
      }
    });
  }
  setCurrentView(view: 'dashboard' | 'users' | 'createUser') {
    this.currentView = view;

    // If switching to dashboard view, make sure the chart is created/updated
    if (view === 'dashboard') {
      setTimeout(() => {
        this.createRentalChart();
      }, 100);
    }

    // If switching to users view, load the users if not already loaded
    if (view === 'users' && (!this.users || this.users.length === 0)) {
      this.loadUsers();
    }
  }

  createUser() {
    if (!this.name ||!this.lastname || !this.phonenumber || !this.email || !this.password|| !this.country || !this.city) {
      console.error("All fields are required!");
      return;
    }

    this.userService.createUser(this.name,this.lastname, this.phonenumber, this.email, this.password, this.country, this.city)
      .then(() => {
        console.log("User created successfully!");
        this.resetForm();
        this.loadUsers();
        this.setCurrentView('users');
        this.successMessage = "User created successfully!";
        setTimeout(() => this.successMessage = '', 3000);
        this.showCreateForm = false;
      })
      .catch(error => {
        console.error("Error creating user:",   error);
        this.errorMessage = "Error creating user: " + error.message;
        setTimeout(() => this.errorMessage = '', 5000)
      });
  }
  loadUsers() {
    this.isLoading = true;
    this.userSubscription = this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load users: ' + error.message;
        this.isLoading = false;
      }
    );
  }
  toggleCreateForm() {
    this.setCurrentView(this.currentView === 'createUser' ? 'dashboard' : 'createUser');
    if (this.currentView !== 'createUser') {
      this.resetForm();
    }
  }
  deleteUser(userId: string) {
    this.userToDelete = userId;
    this.showDeleteConfirmation = true;
  }
  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.isLoading = true;
      this.userService.deleteUser(this.userToDelete)
        .then(() => {
          this.successMessage = "User moved to recycle bin!";
          setTimeout(() => this.successMessage = '', 3000);
          this.loadUsers(); // Refresh the user list
          this.isLoading = false;
        })
        .catch(error => {
          this.errorMessage = "Error deleting user: " + error.message;
          setTimeout(() => this.errorMessage = '', 5000);
          this.isLoading = false;
        });
      this.showDeleteConfirmation = false;
      this.userToDelete = null;
    }}


  toggleUserStatus(user: AgentUser) {
    this.isLoading = true;
    const newStatus = user.isDisabled ? false : true;
    this.userService.updateUserStatus(user.id, newStatus)
      .then(() => {
        this.successMessage = `User ${newStatus ? 'disabled' : 'enabled'} successfully!`;
        setTimeout(() => this.successMessage = '', 3000);
        this.loadUsers(); // Refresh the user list
        this.isLoading = false;
      })
      .catch(error => {
        this.errorMessage = `Error updating user status: ${error.message}`;
        setTimeout(() => this.errorMessage = '', 5000);
        this.isLoading = false;
      });
  }


  resetForm() {
    this.name = '';
    this.lastname='';

    this.phonenumber = '';
    this.email = '';
    this.password = '';
    this.errorMessage = '';
  }
  logout() {
    // Show confirmation modal if needed
    if (confirm('Are you sure you want to logout?')) {
      // Clear any stored tokens/session data
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');

      // Show success message
      this.successMessage = 'Logged out successfully!';

      // Redirect to login page
      // If you're using Angular Router
      this.router.navigate(['/login']);

      // If you're not using Angular Router, you can use
      // window.location.href = '/login.html';
    }
  }}




