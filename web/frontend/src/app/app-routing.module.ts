import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KickstartFormComponent } from './kickstart-form/kickstart-form.component';
import { KitFormComponent } from './kit-form/kit-form.component';
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
import { UpgradeComponent } from './upgrade/component/upgrade.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal', pathMatch: 'full' },
  { path: 'portal', component:  PortalComponent},
  { path: 'health', component:  SystemHealthComponent},
  { path: 'kickstart', component: KickstartFormComponent },
  { path: 'kit_configuration', component: KitFormComponent },
  { path: 'configmaps', component: ConfigmapsComponent },
  { path: 'stdout/:id', component: ServerStdoutComponent },
  { path: 'registry', component: RegistryComponent },
  { path: 'windows_agent_deployer', component: AgentBuilderChooserComponent },
  { path: 'rulesets', component: PolicyManagementComponent},
  { path: 'pcaps', component: PcapFormComponent},
  { path: 'catalog', component: CatalogComponent},
  { path: 'tools', component: ToolsFormComponent},
  { path: 'application/:id', component : CatalogPageComponent},
  { path: 'upgrade', component: UpgradeComponent}
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
