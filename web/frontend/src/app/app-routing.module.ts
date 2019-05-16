import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { KickstartFormComponent } from './kickstart-form/kickstart-form.component';
import { KitFormComponent } from './kit-form/kit-form.component';
import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { PortalComponent } from './portal/portal.component';
import { SystemHealthComponent } from './system-health/system-health.component';
import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { RegistryComponent } from './registry/registry.component';
import { PolicyManagementComponent } from './policy-management/component/policy-management.component';
import { PcapFormComponent } from './pcap-form/pcap-form.component';
import { AgentInstallerComponent } from './agent-installer/agent-installer.component';
import { AgentBuilderChooserComponent } from './agent-builder-chooser/agent-builder-chooser.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'kickstart', component: KickstartFormComponent },
  { path: 'kit_configuration', component: KitFormComponent },
  { path: 'configmaps', component: ConfigmapsComponent },
  { path: 'help', component: HelpComponent },
  { path: 'stdout/:id', component: ServerStdoutComponent },
  { path: 'registry', component: RegistryComponent },
  { path: 'agent-builder-chooser', component: AgentBuilderChooserComponent },
  { path: 'agent_installer', component: AgentInstallerComponent },
  { path: 'rulesets', component: PolicyManagementComponent},
  { path: 'pcaps', component: PcapFormComponent},
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }