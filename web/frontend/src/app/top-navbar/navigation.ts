export interface NavLink {
  label: string;
  url: string;
  icon: string;
  isExternalLink: boolean;
  section: string;
  system: Array<string>;
  privs: boolean;
  target?: string;
  kitStatus: boolean;
}

export interface NavGroup {
  id: string;
  label?: string;
  system: Array<string>;
  children: Array<NavLink>;
}

function filterLinkSection(link: NavLink) {
  return link['section'] == this.id;
}

let allSections: Array<NavGroup> = [
  { id: 'general', label: '', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'system_setup', label: 'System Setup', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'kubernetes', label: 'Kubernetes', system: ['DIP','GIP'], children: [] },
  { id: 'policy_mgmt', label: 'Policy Management', system: ['DIP'], children: [] },
  { id: 'Elastic', label: 'Elastic', system: ['DIP'], children: [] },
  { id: 'tools', label: 'Tools', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'confluence', label: 'Confluence', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'support', label: 'Support', system: ['DIP','MIP','GIP'], children: [] }
]

export function getSideNavigationButtons(system_name: string, userService, kitStatus: boolean, html_spaces) {
  let user = userService.getUser();
  let controller_admin = userService.isControllerAdmin();
  let controller_maintainer = userService.isControllerMaintainer();
  let operator = userService.isOperator();
  let realm_admin = userService.isRealmAdmin();
  let allLinks: Array<NavLink> = [
    { label: user.displayName, url: `https://${window.location.hostname}/auth/realms/CVAH-SSO/account`, icon: 'account_circle', isExternalLink: true, section: 'general', system: ['DIP','MIP','GIP'], privs: true, target: "_blank", kitStatus: false },
    { label: 'Logout', url: `https://${window.location.hostname}/Shibboleth.sso/Logout`, icon: 'exit_to_app', isExternalLink: true, section: 'general', system: ['DIP','MIP','GIP'], privs: true, target: "_self", kitStatus: false },
    { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false, section: 'general', system: ['DIP','MIP','GIP'], privs: true, kitStatus: false },
    { label: 'SSO Admin', url: `https://${window.location.hostname}/auth/admin/CVAH-SSO/console`, icon: 'group', isExternalLink: true, section: 'system_setup', system: ['DIP','MIP','GIP'], privs: realm_admin, target: "_blank", kitStatus: false },
    { label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false, section: 'system_setup', system: ['DIP','MIP','GIP'], privs: controller_admin, kitStatus: false },
    { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false, section: 'system_setup', system: ['DIP','GIP'], privs: controller_admin, kitStatus: false },
    { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: operator, kitStatus: true },
    { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false, section: 'system_setup', system: ['DIP','GIP'], privs: controller_maintainer, kitStatus: true },
    { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: controller_admin, kitStatus: true },
    { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: true, kitStatus: true },
    { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: operator, kitStatus: true },
    { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: true, kitStatus: false },
    { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false, section: 'policy_mgmt', system: ['DIP','GIP'], privs: operator, kitStatus: true },
    { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false, section: 'policy_mgmt', system: ['DIP'], privs: operator, kitStatus: true },
    { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false, section: 'tools', system: ['DIP','MIP','GIP'], privs: controller_maintainer, kitStatus: false },
    { label: 'REST API', url: '/api/docs', icon: 'call_made', isExternalLink: true, section: 'tools', system: ['DIP','MIP','GIP'], privs: operator, kitStatus: false },
    { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false, section: 'Elastic', system: ['DIP'], privs: controller_maintainer, kitStatus: true },
    { label: 'Index Management', url: '/index_management', icon: 'settings', isExternalLink: false, section: 'Elastic', system: ['DIP'], privs: controller_maintainer, kitStatus: true },
    { label: 'Cold Log Ingest', url: '/logingest', icon: 'cloud_download', isExternalLink: false, section: 'Elastic', system: ['DIP','GIP'], privs: operator, kitStatus: true },
    { label: 'MIP Configuration', url: 'mip_config', icon: 'storage', isExternalLink: false, section: 'system_setup', system: ['MIP'], privs: controller_admin, kitStatus: false },
    { label: 'Support', url: 'support', icon: 'contact_phone', isExternalLink: false, section: 'support', system: ['DIP','MIP','GIP'], privs: operator, kitStatus: false }
  ]

  for (let index = 0; index < html_spaces.length; index++) {
    const element = html_spaces[index];
    allLinks.push({ label: element, url: encodeURI(`http://${window.location.hostname}/docs/${element}`), icon: 'book', isExternalLink: true, section: 'confluence', system: ['DIP','MIP','GIP'], privs: true, target: "_blank", kitStatus: false });
  }

  let navigationButtons: Array<NavGroup> = [];
  allSections.forEach((section) => {
    if(section['system'].indexOf(system_name) > -1) {
      let children: Array<NavLink> = [];
      allLinks.forEach((link) => {
        if(link['section'] == section['id'] && link['system'].indexOf(system_name) > -1 && link['privs'] && ((link['kitStatus'] && kitStatus) || !link['kitStatus'])) {
          children.push(link as NavLink);
        }
      });
      if(children.length > 0) {
        section['children'] = children;
        navigationButtons.push(section);
      }
    }
  });
  if (navigationButtons) {
      return navigationButtons
  } else {
      return null
  }
}
