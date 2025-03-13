import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { environment } from '../../enviroments';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from './admin-panel/user.services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgentPanelComponent } from './agent-panel/agent-panel.component';
import { RecycleBinComponent } from './agent-panel/recycle-bin/recycle-bin.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminPanelComponent,
    AgentPanelComponent,
    RecycleBinComponent,



  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,

    AngularFireModule.initializeApp(environment.firebase), // ✅ Correct Firebase initialization
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
  ],
  providers: [UserService
    ,
    //{ provide: FIREBASE_OPTIONS, useValue: environment.firebase }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
