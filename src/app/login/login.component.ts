import { Component } from '@angular/core';
import { AuthService } from './auth.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.login(this.email, this.password);
    
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to login. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
