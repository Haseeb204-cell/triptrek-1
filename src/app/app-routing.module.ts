import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AuthGuard } from './login/auth.guard';
import { AgentPanelComponent } from './agent-panel/agent-panel.component';
import { AgentGuard } from './agent-panel/agent.guard';
import { RecycleBinComponent } from './agent-panel/recycle-bin/recycle-bin.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: 'agent-panel', component: AgentPanelComponent, canActivate: [AgentGuard] },
  { path: 'recycle-bin', component: RecycleBinComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
