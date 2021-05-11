import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgentBuilderChooserComponent } from '../../agent-builder-chooser/agent-builder-chooser.component';
import { CatalogComponent } from '../../catalog/component/catalog.component';
import { CatalogPageComponent } from '../../catalog/page/catalog-page.component';
import { ConfigmapsComponent } from '../../configmaps/configmaps.component';
import { ESScaleComponent } from '../../es-scale/es-scale.component';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from '../../guards';
import { IndexManagementComponent } from '../../index-management/component/index-management.component';
import { LogIngestComponent } from '../../log-ingest/log-ingest.component';
import { MIPConfigComponent } from '../../mip-config/mip-config.component';
import { PcapFormComponent } from '../../pcap-form/pcap-form.component';
import { PolicyManagementComponent } from '../../policy-management/component/policy-management.component';
import { RegistryComponent } from '../../registry/registry.component';
import { SecurityAlertsComponent } from '../../security-alerts/security-alerts.component';
import { ServerStdoutComponent } from '../../server-stdout/server-stdout.component';
import { SupportComponent } from '../../support/support.component';
import { SystemHealthComponent } from '../../system-health/system-health.component';
import { AddNodeComponent } from '../../system-setup/add-node/add-node.component';
import { KickstartComponent } from '../../system-setup/kickstart/kickstart.component';
import { KitComponent } from '../../system-setup/kit/kit.component';
import { ToolsFormComponent } from '../../tools-form/tools.component';
import { PortalComponent } from '../portal/portal.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'support', component:  SupportComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'alerts', component:  SecurityAlertsComponent},
  { path: 'kickstart', component: KickstartComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'kit_configuration', component: KitComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'configmaps', component: ConfigmapsComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'stdout/:jobName/:id', component: ServerStdoutComponent, canActivate: [ ControllerAdminRequiredGuard ]  },
  { path: 'registry', component: RegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'rulesets', component: PolicyManagementComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'pcaps', component: PcapFormComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'catalog', component: CatalogComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'tools', component: ToolsFormComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'application/:id', component : CatalogPageComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'add_node', component: AddNodeComponent, canActivate: [ ControllerAdminRequiredGuard ]},
  { path: 'es_scale', component: ESScaleComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'mip_config', component: MIPConfigComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'index_management', component: IndexManagementComponent, canActivate: [ControllerMaintainerRequiredGuard] },
  { path: 'logingest', component: LogIngestComponent, canActivate: [ OperatorRequiredGuard ] },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
