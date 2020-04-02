import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KickstartComponent } from './system-setup/kickstart/kickstart.component';
import { KitComponent } from './system-setup/kit/kit.component';
import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { PortalComponent } from './portal/portal.component';
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

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'kickstart', component: KickstartComponent },
  { path: 'kit_configuration', component: KitComponent },
  { path: 'configmaps', component: ConfigmapsComponent },
  { path: 'stdout/:id', component: ServerStdoutComponent },
  { path: 'registry', component: RegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent },
  { path: 'rulesets', component: PolicyManagementComponent},
  { path: 'pcaps', component: PcapFormComponent},
  { path: 'catalog', component: CatalogComponent},
  { path: 'tools', component: ToolsFormComponent},
  { path: 'application/:id', component : CatalogPageComponent},
  { path: 'upgrade', component: UpgradeComponent},
  { path: 'add_node', component: AddNodeComponent},
  { path: 'es_scale', component: ESScaleComponent},
  { path: 'mip_config', component: MIPConfigComponent}
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
