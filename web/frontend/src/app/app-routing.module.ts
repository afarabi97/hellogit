import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KickstartComponent } from './system-setup/kickstart/kickstart.component';
import { KitComponent } from './system-setup/kit/kit.component';
import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { PortalComponent } from './portal/portal.component';
import { SupportComponent } from './support/support.component';
import { SystemHealthComponent } from './system-health/system-health.component';
import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { RegistryComponent } from './registry/registry.component';
import { PolicyManagementComponent } from './policy-management/component/policy-management.component';
import { PcapFormComponent } from './pcap-form/pcap-form.component';
import { AgentBuilderChooserComponent } from './agent-builder-chooser/agent-builder-chooser.component';
import { CatalogComponent } from './catalog/component/catalog.component';
import { CatalogPageComponent } from './catalog/page/catalog-page.component';
import { ToolsFormComponent } from './tools-form/tools.component';
import { UpgradeComponent } from './system-setup/upgrade/upgrade.component';
import { AddNodeComponent } from './system-setup/add-node/add-node.component';
import { ESScaleComponent } from './es-scale/es-scale.component';
import { MIPConfigComponent } from './mip-config/mip-config.component';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from './user.service';
import { IndexManagementComponent } from './index-management/component/index-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'support', component:  SupportComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'kickstart', component: KickstartComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'kit_configuration', component: KitComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'configmaps', component: ConfigmapsComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'stdout/:id', component: ServerStdoutComponent, canActivate: [ ControllerAdminRequiredGuard ]  },
  { path: 'registry', component: RegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'rulesets', component: PolicyManagementComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'pcaps', component: PcapFormComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'catalog', component: CatalogComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'tools', component: ToolsFormComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'application/:id', component : CatalogPageComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'upgrade', component: UpgradeComponent, canActivate: [ ControllerAdminRequiredGuard ]},
  { path: 'add_node', component: AddNodeComponent, canActivate: [ ControllerAdminRequiredGuard ]},
  { path: 'es_scale', component: ESScaleComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'mip_config', component: MIPConfigComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'index_management', component: IndexManagementComponent, canActivate: [ControllerMaintainerRequiredGuard] },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
