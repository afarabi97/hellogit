import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgentBuilderChooserComponent } from '../../agent-builder-chooser/agent-builder-chooser.component';
import { CatalogComponent } from '../../catalog/component/catalog.component';
import { CatalogPageComponent } from '../../catalog/page/catalog-page.component';
import { ConfigmapsComponent } from '../config-map/config-map.component';
import { ElasticsearchScaleComponent } from '../elasticsearch-scale/elasticsearch-scale.component';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from '../../guards';
import { IndexManagementComponent } from '../../index-management/component/index-management.component';
import { LogIngestComponent } from '../../log-ingest/log-ingest.component';
import { PcapFormComponent } from '../../pcap-form/pcap-form.component';
import { SecurityAlertsComponent } from '../../security-alerts/security-alerts.component';
import { ServerStdoutComponent } from '../../server-stdout/server-stdout.component';
import { PmoSupportComponent } from '../pmo-support/pmo-support.component';
import { SystemHealthComponent } from '../../system-health/system-health.component';
import { ToolsFormComponent } from '../../tools-form/tools.component';
import { PolicyManagementComponent } from '../policy-management/policy-management.component';
import { DockerRegistryComponent } from '../docker-registry/docker-registry.component';
import { PortalComponent } from '../portal/portal.component';
import { SystemSettingsComponent } from '../../system-setupv2/system-settings/system-settings.component';
import { NodeManagementComponent } from '../../system-setupv2/node-mng/node-mng.component';
import { MipManagementComponent } from '../../system-setupv2/mip-mng/mip-mng.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'support', component:  PmoSupportComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'alerts', component:  SecurityAlertsComponent},
  { path: 'settings', component: SystemSettingsComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'node-mng', component: NodeManagementComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'mip-mng', component: MipManagementComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'configmaps', component: ConfigmapsComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'stdout/:id', component: ServerStdoutComponent, canActivate: [ ControllerAdminRequiredGuard ]  },
  { path: 'registry', component: DockerRegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'rulesets', component: PolicyManagementComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'pcaps', component: PcapFormComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'catalog', component: CatalogComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'tools', component: ToolsFormComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'application/:id', component : CatalogPageComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'es_scale', component: ElasticsearchScaleComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'index_management', component: IndexManagementComponent, canActivate: [ControllerMaintainerRequiredGuard] },
  { path: 'logingest', component: LogIngestComponent, canActivate: [ OperatorRequiredGuard ] },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
