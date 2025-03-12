import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AgentUser } from '../agent-user.model';
import { UserService } from '../agent-user.service';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

@Component({
  selector: 'app-recycle-bin',
  standalone: false,

  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css',
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
export class RecycleBinComponent implements OnInit, OnDestroy {
  deletedUsers: AgentUser[] = [];
  userSubscription: Subscription | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  showRestoreConfirmation: boolean = false;
  showPermanentDeleteConfirmation: boolean = false;
  showEmptyRecycleBinConfirmation: boolean = false;
  userToRestore: string | null = null;
  userToDelete: string | null = null;
  

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadDeletedUsers();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadDeletedUsers() {
    this.isLoading = true;
    this.userSubscription = this.userService.getRecycleBinUsers().subscribe(
      (users) => {
        this.deletedUsers = users;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load deleted users: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  confirmRestore(userId: string) {
    this.userToRestore = userId;
    this.showRestoreConfirmation = true;
  }

  cancelRestore() {
    this.showRestoreConfirmation = false;
    this.userToRestore = null;
  }

  restoreUser() {
    if (this.userToRestore) {
      this.isLoading = true;
      this.userService.restoreUser(this.userToRestore)
        .then(() => {
          this.successMessage = "User restored successfully!";
          setTimeout(() => this.successMessage = '', 3000);
          this.loadDeletedUsers();
          this.isLoading = false;
        })
        .catch(error => {
          this.errorMessage = "Error restoring user: " + error.message;
          setTimeout(() => this.errorMessage = '', 5000);
          this.isLoading = false;
        });
      this.showRestoreConfirmation = false;
      this.userToRestore = null;
    }
  }

  confirmPermanentDelete(userId: string) {
    this.userToDelete = userId;
    this.showPermanentDeleteConfirmation = true;
  }

  cancelPermanentDelete() {
    this.showPermanentDeleteConfirmation = false;
    this.userToDelete = null;
  }

  permanentlyDeleteUser() {
    if (this.userToDelete) {
      this.isLoading = true;
      this.userService.permanentlyDeleteUser(this.userToDelete)
        .then(() => {
          this.successMessage = "User permanently deleted!";
          setTimeout(() => this.successMessage = '', 3000);
          this.loadDeletedUsers();
          this.isLoading = false;
        })
        .catch(error => {
          this.errorMessage = "Error deleting user: " + error.message;
          setTimeout(() => this.errorMessage = '', 5000);
          this.isLoading = false;
        });
      this.showPermanentDeleteConfirmation = false;
      this.userToDelete = null;
    }
  }

  confirmEmptyRecycleBin() {
    this.showEmptyRecycleBinConfirmation = true;
  }

  cancelEmptyRecycleBin() {
    this.showEmptyRecycleBinConfirmation = false;
  }

  emptyRecycleBin() {
    this.isLoading = true;
    this.userService.emptyRecycleBin()
      .then(() => {
        this.successMessage = "Recycle bin emptied successfully!";
        setTimeout(() => this.successMessage = '', 3000);
        this.loadDeletedUsers();
        this.isLoading = false;
      })
      .catch(error => {
        this.errorMessage = "Error emptying recycle bin: " + error.message;
        setTimeout(() => this.errorMessage = '', 5000);
        this.isLoading = false;
      });
    this.showEmptyRecycleBinConfirmation = false;
  }
}
