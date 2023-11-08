export const SECURITY_ALERTS_COMPONENT_TITLE: string = 'Security Alerts';
export const ACTIONS_COLUMN_NAME: string = 'actions';
export const COUNT_COLUMN_NAME: string = 'count';
export const FORM_COLUMN_NAME: string = 'form';
export const LINKS_COLUMN_NAME: string = 'links';
export const RULE_NAME_COLUMN_NAME: string = 'rule.name';
export const EVENT_MODULE_COLUMN_NAME: string = 'event.module';
export const EVENT_KIND_COLUMN_NAME: string = 'event.kind';
export const SIGNAL_RULE_NAME_COLUMN_NAME: string = 'signal.rule.name';
export const TIMESTAMP_COLUMN_NAME: string = 'timestamp';
export const ALL_COLUMNS_START_VALUES: string[] = [ACTIONS_COLUMN_NAME, COUNT_COLUMN_NAME];
export const DYNAMIC_COLUMNS_DEFAULT_VALUES: string[] = [EVENT_MODULE_COLUMN_NAME, EVENT_KIND_COLUMN_NAME, RULE_NAME_COLUMN_NAME];

export const TIMESTAMP_SOURCE: string = '@timestamp';

export const SIGNAL_KIND: string = 'signal';
export const ALERT_KIND: string = 'alert';

export const ENDGAME_MODULE: string = 'endgame';
export const SURICATA_MODULE: string = 'suricata';
export const ZEEK_MODULE: string = 'zeek';
export const SYSTEM_MODULE: string = 'system';
export const SYSMON_MODULE: string = 'sysmon';

export const ENDGAME_INDEX: string = 'endgame-dashboard-index-pattern';

export const KIBANA: string = 'kibana';
export const ARKIME: string = 'arkime';
export const HIVE: string = 'hive';

export const DAYS: string = 'days';
export const HOURS: string = 'hours';
export const MINUTES: string = 'minutes';

export const ARKIME_NOT_INSTALLED_MESSAGE: string = 'Arkime is not installed. Please go to the catalog page and install it if you want this capability to work.';
export const ARKIME_PIVOT_FAIL_MESSAGE: string = 'Failed to pivot to arkime as community ID does not exist.';
export const ARKIME_FIELD_LOOKUP = {
  'source.address': 'ip.src',
  'source.ip': 'ip.src',
  'source.port': 'port.src',
  'destination.port': 'port.dst',
  'destination.address': 'ip.dst',
  'destination.ip': 'ip.dst'
};
export const TIME_FORM_GROUP_COOKIE: string = 'time_form_group';
export const AUTO_REFRESH_COOKIE: string = 'auto_refresh';
export const DYNAMIC_COLUMNS_COOKIE: string = 'dynamic_columns';

export const ACKNOWLEDGE_ALERTS_WINDOW_TITLE: string = 'Acknowledge Alerts';
export const UNACKNOWLEDGED_ALERTS_WINDOW_TITLE: string = 'Unacknowledged Alerts';
export const REMOVE_ALERTS_WINDOW_TITLE: string = 'Remove Alerts';
export const ESCALATE_ALERTS_WINDOW_TITLE: string = 'Escalate Alerts';

// Text
export const NA: string = 'N/A';
export const NA_FAILED_ARKIME_NOT_INSTALLED: string = 'N/A - Failed to create because Arkime is not installed.';
export const MODIFY_API_SWITCH: string = 'modify';
export const REMOVE_API_SWITCH: string = 'remove';
export const HIVE_ORG_ADMIN_TEXT: string = 'org_admin_api_key';
export const EVENT_TITLE_CONFIG_TOOLTIP: string = 'Title of the case';
export const EVENT_TITLE_CONFIG_LABEL: string = 'Title';
export const EVENT_TAGS_CONFIG_TOOLTIP: string = 'Case tags';
export const EVENT_TAGS_CONFIG_LABEL: string = 'Tags';
export const EVENT_DECRIPTION_CONFIG_TOOLTIP: string = 'Description of the case';
export const EVENT_DECRIPTION_CONFIG_LABEL: string = 'Description';
export const EVENT_SEVERITY_CONFIG_TOOLTIP: string = 'Severity of the case (1: low; 2: medium; 3: high)';
export const EVENT_SEVERITY_CONFIG_LABEL: string = 'Severity';

// Snackbar Message
export const ARKIME_NOT_INSTALLED: string = 'Arkime is not installed. Please go to the catalog page and install it if you want this capability to work.';
export const START_DATE_TIME_LARGE: string = 'Zero results returned because start datetime cannot be larger than end datetime.';
export const HIVE_NOT_CONFIGURED: string = `Hive is not configured. Please navigate to System Settings -> Hive Settings to set your Hive API Keys.`;
export const ALERT_LIST_FAILED: string = 'Failed to get event details for the selected Alert group.';

// Kibana Link Pages
export const KIBANA_DETECTIONS_PAGE: string = 'detections';
export const KIBANA_NETWORK_EXTERNAL_PAGE: string = 'network/external-alerts';
export const KIBANA_HOSTS_ALERTS_PAGE: string = 'hosts/alerts';
