// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  AGENT_BUILDER_SERVICE_AGENT_GENERATE: `/api/agent/generate`,
  AGENT_BUILDER_SERVICE_AGENT_CONFIG: `/api/agent/config`,
  AGENT_BUILDER_SERVICE_AGENT_TARGETS: `/api/agent/targets`,
  AGENT_BUILDER_SERVICE_AGENT_HOST: `/api/agent/host/`,
  AGENT_BUILDER_SERVICE_AGENTS_INSTALL: `/api/agent/install`,
  AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL: `/api/agent/uninstall`,
  AGENT_BUILDER_SERVICE_AGENT_REINSTALL: `/api/agent/reinstall`,
  AGENT_BUILDER_SERVICE_AGENT_CONFIGS: `/api/agent/configs`,

  SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO: `/api/policy/sensor/info`,

  CATALOG_SERVICE_BASE: `/api/catalog/`,
  CATALOG_SERVICE_NODES: `/api/catalog/nodes`,
  CATALOG_SERVICE_GENERATE_VALUES: `/api/catalog/generate_values`,
  CATALOG_SERVICE_INSTALL: `/api/catalog/install`,
  CATALOG_SERVICE_REINSTALL: `/api/catalog/reinstall`,
  CATALOG_SERVICE_UNINSTALL: `/api/catalog/uninstall`,
  CATALOG_SERVICE_CHARTS_STATUS: `/api/catalog/charts/status`,
  CATALOG_SERVICE_CHECK_LOGSTASH_INSTALLED: `/api/catalog/chart/logstash/status`,
  CATALOG_SERVICE_GET_CONFIGURED_IFACES: '/api/catalog/configured-ifaces/',

  CONFIG_MAP_SERVICE_GET_CONFIG_MAPS: `/api/kubernetes/configmaps`,
  CONFIG_MAP_SERVICE_BASE_URL: `/api/kubernetes/configmap`,
  CONFIG_MAP_SERVICE_GET_ASSOCIATED_PODS: `/api/kubernetes/associated/pods/`,

  COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE: `/api/coldlog/upload`,
  COLD_LOG_INGEST_SERVICE_GET_WINLOGBEAT_CONFIGURATION: `/api/coldlog/winlogbeat/configure`,
  COLD_LOG_INGEST_SERVICE_POST_WINLOGBEAT: `/api/coldlog/winlogbeat/install`,
  COLD_LOG_INGEST_SERVICE_GET_MODULE_INFO: `/api/coldlog/module/info`,

  INDEX_MANAGEMENT_SERVICE_INDEX_MANAGEMENT: `/api/curator/process`,
  INDEX_MANAGEMENT_SERVICE_GET_CLOSED_INDICES: `/api/curator/indices/closed`,
  INDEX_MANAGEMENT_SERVICE_GET_INDICES: `/api/curator/indices`,

  ELASTICSEARCH_SERVICE_GET_ELASTIC_NODES: `/api/scale/elastic/nodes`,
  ELASTICSEARCH_SERVICE_POST_ELASTIC_NODES: `/api/scale/elastic`,
  ELASTICSEARCH_SERVICE_GET_ELASTIC_FULL_CONFIG: `/api/scale/elastic/advanced`,
  ELASTICSEARCH_SERVICE_POST_ELASTIC_FULL_CONFIG: `/api/scale/elastic/advanced`,
  ELASTICSEARCH_SERVICE_DEPLOY_ELASTIC: `/api/tools/elastic/deploy`,
  ELASTICSEARCH_SERVICE_CHECK_ELASTIC: `/api/scale/check`,

  DIAGNOSTICS_SERVICE_DIAGNOSTICS: `/api/diagnostics`,
  DIAGNOSTICS_SERVICE_DIAGNOSTICS_DOWNLOAD: `/api/diagnostics/download/`,

  SYSTEM_VERSION_SERVICE_SYSTEM_VERSION: `/api/version`,

  USER_SERVICE_CURRENT_USER: `/api/current_user`,

  KICKSTART_SERVICE_GET_UNUSED_IP_ADDRESSES: `/api/unused-ip-addrs`,
  KICKSTART_SERVICE_GET_USED_IP_ADDRESSES: `/api/used-ip-addrs`,
  KICKSTART_SERVICE_GENERATE_KICKSTART_INVENTORY: `/api/generate_kickstart_inventory`,
  KICKSTART_SERVICE_GENERATE_MIP_KICKSTART_INVENTORY: `/api/generate_mip_kickstart_inventory`,
  KICKSTART_SERVICE_GET_KICKSTART_FORM: `/api/get_kickstart_form`,
  KICKSTART_SERVICE_GET_MIP_KICKSTART_FORM: `/api/get_mip_kickstart_form`,
  KICKSTART_SERVICE_UPDATE_KICKSTART_CTRL_IP: `/api/update_kickstart_ctrl_ip/`,
  KICKSTART_SERVICE_ARCHIVE_CONFIGURATIONS_AND_CLEAR: `/api/archive_configurations_and_clear`,

  UPGRADE_SERVICE_UPGRADE_PATHS: `/api/upgrade/paths`,
  UPGRADE_SERVICE_UPGRADE: `/api/upgrade`,

  ADD_NODE_SERVICE_ADD_NODE_WIZARD_STATE: `/api/get_add_node_wizard_state`,

  DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY: `/api/kubernetes/docker/registry`,

  NOTIFICATION_SERVICE_BASE_URL: `/api/notifications`,

  GLOBAL_PCAP_SERVICE_GET_PCAPS: `/api/policy/pcaps`,

  PCAP_SERVICE_BASE: `/api/policy/pcap/`,
  PCAP_SERVICE_UPLOAD_PCAP: `/api/policy/pcap/upload`,
  PCAP_SERVICE_REPLAY_PCAP: `/api/policy/pcap/replay`,

  PORTAL_SERVICE_GET_PORTAL_LINKS: `/api/portal/links`,
  PORTAL_SERVICE_ADD_USER_LINK: `/api/portal/user/links`,
  PORTAL_SERVICE_REMOVE_USER_LINK: `/api/portal/user/links/`,
  PORTAL_SERVICE_GET_USER_LINKS: `/api/portal/user/links`,

  TOOLS_SERVICE_CHANGE_KIT_CLOCK: `/api/tools/change_kit_clock`,
  TOOLS_SERVICE_CHANGE_KIT_PASSWORD: `/api/tools/change-kit-password`,
  TOOLS_SERVICE_UPLOAD_DOCUMENTATION: `/api/tools/documentation/upload`,
  TOOLS_SERVICE_GET_SPACES: `/api/tools/spaces`,
  TOOLS_SERVICE_ES_LICENSE: `/api/tools/es_license`,
  TOOLS_SERVICE_MONITORING_INTERFACE: `/api/tools/monitoring-interfaces`,
  TOOLS_SERVICE_CONFIGURE_REPOSITORY: `/api/tools/snapshot`,

  NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME: `/api/tools/controller/datetime`,

  ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES: `/api/agent/endgame/profiles`,

  HEALTH_SERVICE_GET_NODES_STATUS: `/api/kubernetes/nodes/status`,
  HEALTH_SERVICE_GET_PODS_STATUS: `/api/kubernetes/pods/status`,
  HEALTH_SERVICE_GET_APPLICATIONS_STATUS: `/api/health/applications/status`,
  HEALTH_SERVICE_GET_SNMP_STATUS: `/api/health/snmp/status`,
  HEALTH_SERVICE_GET_SNMP_ALERTS: `/api/health/snmp/alerts`,
  HEALTH_SERVICE_GET_DATASTORES: `/api/health/datastores`,
  HEALTH_SERVICE_DESCRIBE_NODE: `/api/kubernetes/node/describe`,
  HEALTH_SERVICE_DESCRIBE_POD: `/api/kubernetes/pod/describe`,
  HEALTH_SERVICE_POD_LOGS: `/api/kubernetes/pod/logs`,
  HEALTH_SERVICE_WRITE_REJECTS: `/api/app/elasticsearch/rejects`,
  HEALTH_SERVICE_APP: `/api/app`,
  HEALTH_SERVICE_REMOTE: `/api/kubernetes/remote`,

  RULES_SERVICE_RULE_SETS: `/api/policy/ruleset`,
  RULES_SERVICE_RULE_SETS_SYNC: `/api/policy/rulesets/sync`,
  RULES_SERVICE_UPLOAD_RULE_FILE: `/api/policy/rule/upload`,
  RULES_SERVICE_RULES: `/api/policy/rules`,
  RULES_SERVICE_RULE: `/api/policy/rule`,
  RULES_SERVICE_RULE_VALIDATE: `/api/policy/rule/validate`,
  RULES_SERVICE_TEST_RULE_AGAINST_PCAP: `/api/policy/pcap/rule/test`,

  POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS: `/api/catalog/chart`,
  POLICY_MANAGEMENT_SERVICE_GET_JOBS: `/api/jobs`,

  KIT_TOKENS_SETTINGS_SERVICE: `/api/token`,
  HEALTH_DASHBOARD_STATUS: `/api/health/dashboard/status`,
  REMOTE_HEALTH_DASHBOARD_STATUS: `/api/health/remote/dashboard/status`,
  HEALTH_DASHBOARD_KIBANA_INFO: `/api/app/kibana/info`,
  REMOTE_HEALTH_DASHBOARD_KIBANA_INFO: `/api/app/kibana/info/remote`
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
