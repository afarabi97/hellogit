import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from '../../guards';
import { AgentBuilderChooserComponent } from '../agent-builder-chooser/agent-builder-chooser.component';
import { CatalogComponent } from '../catalog/catalog.component';
import { CatalogPageComponent } from '../catalog/components/catalog-page/catalog-page.component';
import { ConfigmapsComponent } from '../config-map/config-map.component';
import { DockerRegistryComponent } from '../docker-registry/docker-registry.component';
import { ColdLogIngestComponent } from '../elasticsearch-cold-log-ingest/cold-log-ingest.component';
import {
  ElasticsearchIndexManagementComponent
} from '../elasticsearch-index-management/elasticsearch-index-management.component';
import { ElasticsearchScaleComponent } from '../elasticsearch-scale/elasticsearch-scale.component';
import { HealthDashboardComponent } from '../health-dashboard/health-dashboard.component';
import { MipManagementComponent } from '../mip-mng/mip-mng.component';
import { NodeManagementComponent } from '../node-mng/node-mng.component';
import { PcapFormComponent } from '../pcap-form/pcap-form.component';
import { PmoSupportComponent } from '../pmo-support/pmo-support.component';
import { PolicyManagementComponent } from '../policy-management/policy-management.component';
import { PortalComponent } from '../portal/portal.component';
import { SecurityAlertsComponent } from '../security-alerts/security-alerts.component';
import { SystemSettingsComponent } from '../system-settings/system-settings.component';
import { ToolsFormComponent } from '../tools/tools.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent },
  { path: 'support', component:  PmoSupportComponent },
  { path: 'health', component:  HealthDashboardComponent },
  { path: 'alerts', component:  SecurityAlertsComponent },
  { path: 'settings', component: SystemSettingsComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'node-mng', component: NodeManagementComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'mip-mng', component: MipManagementComponent, canActivate: [ ControllerAdminRequiredGuard ] },
  { path: 'configmaps', component: ConfigmapsComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'registry', component: DockerRegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'rulesets', component: PolicyManagementComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'pcaps', component: PcapFormComponent, canActivate: [ OperatorRequiredGuard ] },
  { path: 'catalog', component: CatalogComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'tools', component: ToolsFormComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'application/:id', component : CatalogPageComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'es_scale', component: ElasticsearchScaleComponent, canActivate: [ ControllerMaintainerRequiredGuard ] },
  { path: 'index_management', component: ElasticsearchIndexManagementComponent, canActivate: [ControllerMaintainerRequiredGuard] },
  { path: 'logingest', component: ColdLogIngestComponent, canActivate: [ OperatorRequiredGuard ] }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
