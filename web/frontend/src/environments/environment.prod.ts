export const environment = {
  production: true,

  SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO: `/api/get_sensor_hostinfo`,

  USER_SERVICE_CURRENT_USER: `/api/current_user`,

  WEAPON_SYSTEM_NAME_SERVICE_SYSTEM_NAME: `/api/get_system_name`,

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
  KICKSTART_SERVICE_GATHER_DEVICE_FACTS: `/api/gather-device-facts`,
  KICKSTART_SERVICE_GENERATE_KICKSTART_INVENTORY: `/api/generate_kickstart_inventory`,
  KICKSTART_SERVICE_GENERATE_MIP_KICKSTART_INVENTORY: `/api/generate_mip_kickstart_inventory`,
  KICKSTART_SERVICE_GET_KICKSTART_FORM: `/api/get_kickstart_form`,
  KICKSTART_SERVICE_GET_MIP_KICKSTART_FORM: `/api/get_mip_kickstart_form`,
  KICKSTART_SERVICE_UPDATE_KICKSTART_CTRL_IP: `/api/update_kickstart_ctrl_ip/`,
  KICKSTART_SERVICE_ARCHIVE_CONFIGURATIONS_AND_CLEAR: `/api/archive_configurations_and_clear`,

  UPGRADE_SERVICE_UPGRADE_PATHS: `/api/upgrade/paths`,
  UPGRADE_SERVICE_UPGRADE: `/api/upgrade`,

  ADD_NODE_SERVICE_ADD_NODE_WIZARD_STATE: `/api/get_add_node_wizard_state`,

  HEALTH_STATUS_SERVICE_GET_HEALTH_STATUS: `/api/health/status`,
  HEALTH_STATUS_SERVICE_GET_PIPELINE_STATUS: `/api/pipeline/status`,
  HEALTH_STATUS_SERVICE_DESCRIBE_POD: `/api/pod/describe/`,
  HEALTH_STATUS_SERVICE_POD_LOGS: `/api/pod/logs/`,
  HEALTH_STATUS_SERVICE_DESCRIBE_NODE: `/api/node/describe/`,

  DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY: `/api/docker/registry`,

  PORTAL_SERVICE_GET_PORTAL_LINKS: `/api/get_portal_links`,
  PORTAL_SERVICE_ADD_USER_LINK: `/api/add_user_link`,
  PORTAL_SERVICE_REMOVE_USER_LINK: `/api/remove_user_link/`,
  PORTAL_SERVICE_GET_USER_LINKS: `/api/get_user_links`,
  TOOLS_SERVICE_CHANGE_KIT_CLOCK: `/api/change_kit_clock`,
  TOOLS_SERVICE_CHANGE_KIT_PASSWORD: `/api/change-kit-password`,
  TOOLS_SERVICE_UPLOAD_DOCUMENTATION: `/api/documentation/upload`,
  TOOLS_SERVICE_ES_LICENSE: `/api/es_license`,
  TOOLS_SERVICE_GET_SPACES: `/api/spaces`,
  TOOLS_SERVICE_MONITORING_INTERFACE: `/api/monitoring-interfaces`,
  TOOLS_SERVICE_CONFIGURE_REPOSITORY: `/api/snapshot`,

  NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME: `/api/controller/datetime`,
  NAV_BAR_SERVICE_VERSION: `/api/version`,

  ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES: `/api/endgame_sensor_profiles`,

  SYSTEM_HEALTH_SERVICE_GET_HEALTH_STATUS: `/api/health/status`,
  SYSTEM_HEALTH_SERVICE_GET_PIPELINE_STATUS: `/api/pipeline/status`,
  SYSTEM_HEALTH_SERVICE_DESCRIBE_POD: `/api/pod/describe`,
  SYSTEM_HEALTH_SERVICE_POD_LOGS: `/api/pod/logs`,
  SYSTEM_HEALTH_SERVICE_DESCRIBE_NODE: `/api/node/describe`,

  RULES_SERVICE_RULE_SETS: `/api/ruleset`,
  RULES_SERVICE_RULE_SETS_SYNC: `/api/rulesets/sync`,
  RULES_SERVICE_UPLOAD_RULE_FILE: `/api/rule/upload`,
  RULES_SERVICE_RULES: `/api/rules`,
  RULES_SERVICE_RULE: `/api/rule`,
  RULES_SERVICE_RULE_VALIDATE: `/api/rule/validate`,
  RULES_SERVICE_TEST_RULE_AGAINST_PCAP: `/api/pcap/rule/test`,

  POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS: `/api/catalog/chart`,
  POLICY_MANAGEMENT_SERVICE_GET_JOBS: `/api/jobs`
};
