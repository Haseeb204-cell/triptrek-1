import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, from, map, Observable, of } from 'rxjs';
import { AgentUser, RawAgentUserData } from './agent-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

  async createUser(name: string, lastname: string, phonenumber: string, email: string, password: string, country: string, city: string) {
    try {

      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user?.uid;

      if (userId) {

        await this.db.database.ref(`/agent-users/${userId}`).set({
          name,
          lastname,
          phonenumber,
          email,
          country,
          city,
          createdAt: new Date().toISOString()
        });

        console.log("User successfully created and stored in 'agent-users' node!");

      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  getUsers(): Observable<AgentUser[]> {
    return from(
      this.db.database.ref('/agent-users').once('value')
    ).pipe(
      map(snapshot => {
        const users = snapshot.val() as RawAgentUserData;

        if (!users) return [];

        return Object.entries(users).map(([id, userData]) => ({
          id,
          ...userData
        }));
      }),
      catchError(error => {
        console.error('Error fetching agent users:', error);
        return of([]);
      })
    );
  }
  getRecycleBinUsers(): Observable<AgentUser[]> {
    return from(
      this.db.database.ref('/recycle-bin-agent').once('value')
    ).pipe(
      map(snapshot => {
        const users = snapshot.val() as RawAgentUserData;

        if (!users) return [];

        return Object.entries(users).map(([id, userData]) => ({
          id,
          ...userData,
          deletedAt: userData.deletedAt || userData.deletedAt
        }));
      }),
      catchError(error => {
        console.error('Error fetching recycle bin users:', error);
        return of([]);
      })
    );
  }

  async deleteUser(userId: string) {
    try {
      // First get the user data
      const userSnapshot = await this.db.database.ref(`/agent-users/${userId}`).once('value');
      const userData = userSnapshot.val();

      if (!userData) {
        throw new Error('User not found');
      }

      // Add deletedAt timestamp
      userData.deletedAt = new Date().toISOString();

      // Move to recycle bin
      await this.db.database.ref(`/recycle-bin-agent/${userId}`).set(userData);

      // Remove from active users
      await this.db.database.ref(`/agent-users/${userId}`).remove();

      return true;
    } catch (error) {
      console.error('Error moving user to recycle bin:', error);
      throw error;
    }
  }

  async restoreUser(userId: string) {
    try {
      // Get user data from recycle bin
      const userSnapshot = await this.db.database.ref(`/recycle-bin-agent/${userId}`).once('value');
      const userData = userSnapshot.val();

      if (!userData) {
        throw new Error('User not found in recycle bin');
      }

      // Create a copy without the deletedAt property
      const { deletedAt, ...userDataWithoutDeletedAt } = userData;

      // Move back to active users
      await this.db.database.ref(`/agent-users/${userId}`).set(userDataWithoutDeletedAt);

      // Remove from recycle bin
      await this.db.database.ref(`/recycle-bin-agent/${userId}`).remove();

      return true;
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  }

  async permanentlyDeleteUser(userId: string) {
    try {
      // Remove from recycle bin
      await this.db.database.ref(`/recycle-bin-agent/${userId}`).remove();
      return true;
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      throw error;
    }
  }

  async emptyRecycleBin() {
    try {
      await this.db.database.ref('/recycle-bin-agent').remove();
      return true;
    } catch (error) {
      console.error('Error emptying recycle bin:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, isDisabled: boolean) {
    try {
      await this.db.database.ref(`/agent-users/${userId}`).update({
        isDisabled: isDisabled
      });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}
