// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO: `/api/get_sensor_hostinfo`,

  CONFIG_MAP_SERVICE_GET_CONFIG_MAPS: `/api/configmaps`,
  CONFIG_MAP_SERVICE_BASE_URL: `/api/configmap`,
  CONFIG_MAP_SERVICE_GET_ASSOCIATED_PODS: `/api/associated/pods/`,

  COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE: `/api/upload_cold_log_file`,
  COLD_LOG_INGEST_SERVICE_GET_WINLOGBEAT_CONFIGURATION: `/api/get_winlogbeat_configuration`,
  COLD_LOG_INGEST_SERVICE_POST_WINLOGBEAT: `/api/install_winlogbeat`,
  COLD_LOG_INGEST_SERVICE_GET_MODULE_INFO: `/api/get_module_info`,

  INDEX_MANAGEMENT_SERVICE_INDEX_MANAGEMENT: `/api/index_management`,
  INDEX_MANAGEMENT_SERVICE_GET_CLOSED_INDICES: `/api/closed_indices`,
  INDEX_MANAGEMENT_SERVICE_GET_OPENED_INDICES: `/api/opened_indices`,

  ELASTICSEARCH_SERVICE_GET_ELASTIC_NODES: `/api/scale/elastic/nodes`,
  ELASTICSEARCH_SERVICE_POST_ELASTIC_NODES: `/api/scale/elastic`,
  ELASTICSEARCH_SERVICE_GET_ELASTIC_FULL_CONFIG: `/api/scale/elastic/advanced`,
  ELASTICSEARCH_SERVICE_POST_ELASTIC_FULL_CONFIG: `/api/scale/elastic/advanced`,
  ELASTICSEARCH_SERVICE_DEPLOY_ELASTIC: `/api/apply_elastic_deploy`,
  ELASTICSEARCH_SERVICE_CHECK_ELASTIC: `/api/scale/check`,

  DIAGNOSTICS_SERVICE_DIAGNOSTICS: `/api/diagnostics`,
  DIAGNOSTICS_SERVICE_DIAGNOSTICS_DOWNLOAD: `/api/diagnostics/download/`,

  SYSTEM_VERSION_SERVICE_SYSTEM_VERSION: `/api/version`,

  USER_SERVICE_CURRENT_USER: `/api/current_user`,

  ARCHIVE_SERVICE_ARCHIVE_FORM: `/api/archive_form`,
  ARCHIVE_SERVICE_ARCHIVE_DELETE: `/api/delete_archive/`,
  ARCHIVE_SERVICE_ARCHIVE_RESTORE: `/api/restore_archived`,
  ARCHIVE_SERVICE_ARCHIVE_GET: `/api/get_archived/`,

  AGENT_BUILDER_SERVICE_GENERATE_WINDOWS_INSTALLER: `/api/generate_windows_installer`,
  AGENT_BUILDER_SERVICE_SAVE_AGENT_INSTALLER_CONFIG: `/api/save_agent_installer_config`,
  AGENT_BUILDER_SERVICE_DELETE_AGENT_INSTALLER_CONFIG: `/api/delete_agent_installer_config/`,
  AGENT_BUILDER_SERVICE_GET_AGENT_INSTALLER_CONFIGS: `/api/get_agent_installer_configs`,
  AGENT_BUILDER_SERVICE_GET_AGENT_INSTALLER_TARGET_LISTS: `/api/get_agent_installer_target_lists`,
  AGENT_BUILDER_SERVICE_SAVE_AGENT_INSTALLER_TARGET_LIST: `/api/save_agent_installer_target_list`,
  AGENT_BUILDER_SERVICE_ADD_HOST_TO_IP_TARGET_LIST: `/api/add_host/`,
  AGENT_BUILDER_SERVICE_DELETE_HOST_FROM_IP_TARGET_LIST: `/api/delete_host/`,
  AGENT_BUILDER_SERVICE_DELETE_AGENT_INSTALLER_TARGET_LIST: `/api/delete_agent_installer_target_list/`,
  AGENT_BUILDER_SERVICE_INSTALL_AGENTS: `/api/install_agents`,
  AGENT_BUILDER_SERVICE_UNINSTALL_AGENTS: `/api/uninstall_agents`,
  AGENT_BUILDER_SERVICE_UNINSTALL_AGENT: `/api/uninstall_agent`,
  AGENT_BUILDER_SERVICE_REINSTALL_AGENT: `/api/reinstall_agent`,
  AGENT_BUILDER_SERVICE_CHECK_LOGSTASH_INSTALLED: `/api/catalog/chart/logstash/status`,
  AGENT_BUILDER_SERVICE_CUSTOM_WINDOWS_INSTALLER_PACKAGES: `/api/custom_windows_installer_packages`,

  KIT_SERVICE_GET_KIT_FORM: `/api/get_kit_form`,
  KIT_SERVICE_EXECUTE_KIT_INVENTORY: `/api/execute_kit_inventory`,
  KIT_SERVICE_GENERATE_KIT_INVENTORY: `/api/generate-kit-inventory`,
  KIT_SERVICE_EXECUTE_ADD_NODE: `/api/execute_add_node`,
  KIT_SERVICE_EXECUTE_REMOVE_NODE: `/api/execute_remove_node`,

  KICKSTART_SERVICE_GET_AVAILABLE_IP_BLOCKS: `/api/available-ip-blocks`,
  KICKSTART_SERVICE_GET_IP_BLOCKS: `/api/ip-blocks/`,
  KICKSTART_SERVICE_GET_UNUSED_IP_ADDRESSES: `/api/unused-ip-addrs`,
  KICKSTART_SERVICE_GENERATE_KICKSTART_INVENTORY: `/api/generate_kickstart_inventory`,
  KICKSTART_SERVICE_GENERATE_MIP_KICKSTART_INVENTORY: `/api/generate_mip_kickstart_inventory`,
  KICKSTART_SERVICE_GET_KICKSTART_FORM: `/api/get_kickstart_form`,
  KICKSTART_SERVICE_GET_MIP_KICKSTART_FORM: `/api/get_mip_kickstart_form`,
  KICKSTART_SERVICE_UPDATE_KICKSTART_CTRL_IP: `/api/update_kickstart_ctrl_ip/`,
  KICKSTART_SERVICE_ARCHIVE_CONFIGURATIONS_AND_CLEAR: `/api/archive_configurations_and_clear`,

  UPGRADE_SERVICE_UPGRADE_PATHS: `/api/upgrade/paths`,
  UPGRADE_SERVICE_UPGRADE: `/api/upgrade`,

  ADD_NODE_SERVICE_ADD_NODE_WIZARD_STATE: `/api/get_add_node_wizard_state`,

  DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY: `/api/docker/registry`,

  PORTAL_SERVICE_GET_PORTAL_LINKS: `/api/get_portal_links`,
  PORTAL_SERVICE_ADD_USER_LINK: `/api/add_user_link`,
  PORTAL_SERVICE_REMOVE_USER_LINK: `/api/remove_user_link/`,
  PORTAL_SERVICE_GET_USER_LINKS: `/api/get_user_links`,

  TOOLS_SERVICE_CHANGE_KIT_CLOCK: `/api/change_kit_clock`,
  TOOLS_SERVICE_CHANGE_KIT_PASSWORD: `/api/change-kit-password`,
  TOOLS_SERVICE_UPLOAD_DOCUMENTATION: `/api/documentation/upload`,
  TOOLS_SERVICE_GET_SPACES: `/api/spaces`,
  TOOLS_SERVICE_ES_LICENSE: `/api/es_license`,
  TOOLS_SERVICE_MONITORING_INTERFACE: `/api/monitoring-interfaces`,
  TOOLS_SERVICE_CONFIGURE_REPOSITORY: `/api/snapshot`,

  NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME: `/api/controller/datetime`,

  ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES: `/api/endgame_sensor_profiles`,

  HEALTH_SERVICE_GET_NODES_STATUS: `/api/health/nodes/status`,
  HEALTH_SERVICE_GET_PODS_STATUS: `/api/health/pods/status`,
  HEALTH_SERVICE_GET_APPLICATIONS_STATUS: `/api/health/applications/status`,
  HEALTH_SERVICE_GET_SNMP_STATUS: `/api/health/snmp/status`,
  HEALTH_SERVICE_GET_SNMP_ALERTS: `/api/health/snmp/alerts`,
  HEALTH_SERVICE_GET_DATASTORES: `/api/health/datastores`,
  HEALTH_SERVICE_DESCRIBE_NODE: `/api/node/describe`,
  HEALTH_SERVICE_DESCRIBE_POD: `/api/pod/describe`,
  HEALTH_SERVICE_POD_LOGS: `/api/pod/logs`,
  HEALTH_SERVICE_WRITE_REJECTS: `/api/write/rejects`,
  HEALTH_SERVICE_APP: `/api/app`,
  HEALTH_SERVICE_REMOTE: `/api/remote-health`,

  RULES_SERVICE_RULE_SETS: `/api/ruleset`,
  RULES_SERVICE_RULE_SETS_SYNC: `/api/rulesets/sync`,
  RULES_SERVICE_UPLOAD_RULE_FILE: `/api/rule/upload`,
  RULES_SERVICE_RULES: `/api/rules`,
  RULES_SERVICE_RULE: `/api/rule`,
  RULES_SERVICE_RULE_VALIDATE: `/api/rule/validate`,
  RULES_SERVICE_TEST_RULE_AGAINST_PCAP: `/api/pcap/rule/test`,

  POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS: `/api/catalog/chart`,
  POLICY_MANAGEMENT_SERVICE_GET_JOBS: `/api/jobs`,

  KIT_TOKENS_SETTINGS_SERVICE: `/api/kit/tokens`,
  HEALTH_DASHBOARD_STATUS: `/api/health/dashboard/status`,
  REMOTE_HEALTH_DASHBOARD_STATUS: `/api/remote/health/dashboard/status`,
  HEALTH_DASHBOARD_KIBANA_INFO: `/api/health/dashboard/kibana/info`,
  REMOTE_HEALTH_DASHBOARD_KIBANA_INFO: `/api/remote/health/dashboard/kibana/info`,
  GENERATE_TOKEN: `/api/kit/tokens/generate`
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
