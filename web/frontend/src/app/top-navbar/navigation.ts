export interface NavLink {
  label: string;
  url: string;
  icon: string;
  isExternalLink: boolean;
  section: string;
  system: Array<string>;
  privs: boolean;
  target?: string;
}

export interface NavGroup {
  id: string,
  label?: string,
  system: Array<string>,
  children: Array<NavLink>
}

function filterLinkSection(link: NavLink) {
  return link['section'] == this.id;
}

let allSections: Array<NavGroup> = [
  { id: 'general', label: '', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'system_setup', label: 'System Setup', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'kubernetes', label: 'Kubernetes', system: ['DIP','GIP'], children: [] },
  { id: 'policy_mgmt', label: 'Policy Management', system: ['DIP'], children: [] },
  { id: 'tools', label: 'Tools', system: ['DIP','MIP','GIP'], children: [] },
  { id: 'confluence', label: 'Confluence', system: ['DIP','MIP','GIP'], children: [] }
]

export function getSideNavigationButtons(system_name: string, userService) {
  let user = userService.getUser();
  let controller_admin = userService.isControllerAdmin();
  let controller_maintainer = userService.isControllerMaintainer();
  let operator = userService.isOperator();
  let realm_admin = userService.isRealmAdmin();
  let allLinks: Array<NavLink> = [
    { label: user.displayName, url: `https://${window.location.hostname}/auth/realms/CVAH-SSO/account`, icon: 'account_circle', isExternalLink: true, section: 'general', system: ['DIP','MIP','GIP'], privs: true, target: "_blank" },
    { label: 'Logout', url: `https://${window.location.hostname}/Shibboleth.sso/Logout`, icon: 'exit_to_app', isExternalLink: true, section: 'general', system: ['DIP','MIP','GIP'], privs: true, target: "_self" },
    { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false, section: 'general', system: ['DIP','MIP','GIP'], privs: true },
    { label: 'SSO Admin', url: `https://${window.location.hostname}/auth/admin/CVAH-SSO/console`, icon: 'group', isExternalLink: true, section: 'system_setup', system: ['DIP','MIP','GIP'], privs: realm_admin, target: "_blank" },
    { label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false, section: 'system_setup', system: ['DIP','MIP','GIP'], privs: controller_admin },
    { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false, section: 'system_setup', system: ['DIP','GIP'], privs: controller_admin },
    { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: operator },
    { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false, section: 'system_setup', system: ['DIP','GIP'], privs: controller_maintainer },
    { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: controller_admin },
    { label: 'Upgrade', url: '/upgrade', icon: 'timeline', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: controller_admin },
    { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false, section: 'system_setup', system: ['DIP'], privs: controller_maintainer },
    { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: true },
    { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: operator },
    { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false, section: 'kubernetes', system: ['DIP','GIP'], privs: true },
    { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false, section: 'policy_mgmt', system: ['DIP','GIP'], privs: operator },
    { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false, section: 'policy_mgmt', system: ['DIP'], privs: operator },
    { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false, section: 'tools', system: ['DIP','MIP','GIP'], privs: controller_maintainer },
    { label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book', isExternalLink: true, section: 'confluence', system: ['DIP','MIP','GIP'], privs: true, target: "_blank" },
    { label: 'MIP Configuration', url: 'mip_config', icon: 'storage', isExternalLink: false, section: 'system_setup', system: ['MIP'], privs: controller_admin }
  ]
  let navigationButtons: Array<NavGroup> = [];
  allSections.forEach((section) => {
    if(section['system'].indexOf(system_name) > -1) {
      allLinks.filter(filterLinkSection, section).forEach((link) => {
        if(link['system'].indexOf(system_name) > -1 && link['privs']) {
          section['children'].push(link as NavLink);
        }
      });
      if(section['children'].length > 0) {
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
