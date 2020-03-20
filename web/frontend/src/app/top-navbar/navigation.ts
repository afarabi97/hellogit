const portal = { label: 'Portal', url: '/portal', icon: 'dashboard', isExternalLink: false };
const kickstart = { label: 'Kickstart Configuration', url: '/kickstart', icon: 'layers', isExternalLink: false };
const kit = { label: 'Kit Configuration', url: '/kit_configuration', icon: 'storage', isExternalLink: false }
const windowsAgents = { label: 'Install Windows Agents', url: '/windows_agent_deployer', icon: 'cloud_download', isExternalLink: false };
const catalog = { label: 'Catalog', url: '/catalog', icon: 'apps', isExternalLink: false };
const addNode = { label: 'Add Node', url: '/add_node', icon: 'computer', isExternalLink: false };
const upgrade = { label: 'Upgrade', url: '/upgrade', icon: 'timeline', isExternalLink: false };
const esScale = { label: 'ES Scale', url: '/es_scale', icon: 'tune', isExternalLink: false };
const health = { label: 'Health', url: '/health', icon: 'local_hospital', isExternalLink: false };
const configurationMaps = { label: 'Configuration Maps', url: '/configmaps', icon: 'swap_calls', isExternalLink: false };
const dockerRegistry = { label: 'Docker Registry', url: '/registry', icon: 'view_day', isExternalLink: false };
const rulesets = { label: 'Rule Set', url: '/rulesets', icon: 'swap_horiz', isExternalLink: false };
const pcaps = { label: 'Test PCAP files', url: 'pcaps', icon: 'security', isExternalLink: false };
const tools = { label: 'Tools', url: '/tools', icon: 'build', isExternalLink: false };
const thisiscvah = { label: 'THISISCVAH', url: `http://${window.location.hostname}/THISISCVAH`, icon: 'book', isExternalLink: true };

export interface NavLink {
  label: string;
  url: string;
  icon: string;
  isExternalLink: boolean;
}

export interface NavGroup {
  label?: string,
  children: Array<NavLink>
}

const dipNavigation: Array<NavGroup> = [
  {
    children: [portal]
  },
  {
    label: 'System Setup',
    children: [
      kickstart,
      kit,
      windowsAgents,
      catalog,
      addNode,
      upgrade,
      esScale
    ]
  },
  {
    label: 'Kubernetes',
    children: [
      health,
      configurationMaps,
      dockerRegistry
    ]
  },
  {
    label: 'Policy Management',
    children: [
      rulesets,
      pcaps
    ]
  },
  {
    label: 'Tools',
    children: [tools]
  },
  {
    label: 'Confluence',
    children: [
      thisiscvah
    ]
  }
];


const mipNavigation: Array<NavGroup> = [
  {
    children: [portal]
  },
  {
    label: 'System Setup',
    children: [
      kickstart,
      kit
    ]
  },
  {
    label: 'Tools',
    children: [tools]
  },
  {
    label: 'Confluence',
    children: [
      thisiscvah
    ]
  }
];

const gipNavigation: Array<NavGroup> = [
  {
    children: [portal]
  },
  {
    label: 'System Setup',
    children: [
      kickstart,
      kit
    ]
  },
  {
    label: 'Tools',
    children: [tools]
  },
  {
    label: 'Confluence',
    children: [
      thisiscvah
    ]
  }
];

const navigation = {
  'DIP': dipNavigation,
  'MIP': mipNavigation,
  'GIP': gipNavigation
}

export function getSideNavigationButtons(system_name: string) {
    let navigationButtons = navigation[system_name];
    if (navigationButtons) {
        return navigationButtons
    } else {
        return null
    }
}
