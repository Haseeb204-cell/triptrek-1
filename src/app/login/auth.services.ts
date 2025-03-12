import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import { UserService } from '../admin-panel/user.services';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<firebase.User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private auth: AngularFireAuth;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.auth = inject(AngularFireAuth);
    this.auth.authState.subscribe((user: firebase.User | null) => {
      if (user) {
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        if (result.user.email === 'admin@triptrek.com') {
          this.router.navigate(['/admin-panel']);
        } else if (result.user.email?.endsWith('@agent.com')) {
          this.router.navigate(['/agent-panel']);
        } else {
          this.router.navigate(['/']);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed. Please try again.');
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAgent(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && !!user.email && user.email.endsWith('@agent.com');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.email === 'admin@triptrek.com';
  }
}
