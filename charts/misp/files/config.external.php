<?php
$config['MISP']['language']= 'eng';
$config['MISP']['live']= true;
$config['MISP']['baseurl']= $_SERVER['BASE_URL'];
$config['MISP']['external_baseurl']= $_SERVER['BASE_URL'];
$config['MISP']['host_org_id']= 1;
$config['Security']['password_policy_length']= '4';
$config['Security']['password_policy_complexity']= '/^.{4,}/';
// Configuration for shibboleth authentication
$config['Security']['auth']= array('ShibbAuth.ApacheShibb');
$config['ApacheShibbAuth'] = array(
  'apacheEnv'         => 'REMOTE_USER',        // If proxy variable = HTTP_REMOTE_USER
  'MailTag'           => 'email',
  //'OrgTag'            => 'FEDERATION_TAG',
  'GroupTag'          => 'roles',
  'GroupSeparator'    => ';',
  'GroupRoleMatching' => array(                // 3:User, 1:admin. May be good to set "1" for the first user
    'misp-admin'   => 1, # Admin
    'misp-org-admin'   => 2, # Org Admin
    'misp-operator' => 3, # User
    'misp-readonly'   => 6, # Read Only
  ),
  'DefaultRoleId'     => 3,
  'DefaultOrg'        => $_SERVER['ORG_NAME'],
);
if( isset($_SERVER['MISP_MODULES_URL']) && $_SERVER['MISP_MODULES_URL'] !== '' && isset($_SERVER['MISP_MODULES_PORT']) && $_SERVER['MISP_MODULES_PORT'] !== '') {
    $misp_module_settings =   array (
        'Enrichment_services_enable' => true,
        'Enrichment_hover_enable' => true,
        'Enrichment_timeout' => 300,
        'Enrichment_hover_timeout' => 150,
        'Enrichment_services_url' => $_SERVER['MISP_MODULES_URL'],
        'Enrichment_services_port' => (int) $_SERVER['MISP_MODULES_PORT'],
        'Import_services_enable' => true,
        'Import_services_url' => $_SERVER['MISP_MODULES_URL'],
        'Import_services_port' => (int) $_SERVER['MISP_MODULES_PORT'],
        'Import_timeout' => 300,
        'Export_services_enable' => true,
        'Export_services_url' => $_SERVER['MISP_MODULES_URL'],
        'Export_services_port' => (int) $_SERVER['MISP_MODULES_PORT'],
        'Export_timeout' => 300,
        'Cortex_services_enable' => false,
        'Cortex_services_url' => 'https://cortex.default.svc.cluster.local',
        'Cortex_services_port' => 443,
        'Cortex_authkey' => '',
        'Cortex_timeout' => 120,
        'Cortex_ssl_verify_peer' => true,
        'Cortex_ssl_verify_host' => true,
        'Cortex_ssl_allow_self_signed' => false,
        'Cortex_ssl_cafile' => '/etc/ssl/certs/container/ca.crt',
  );
  if(isset($config['Plugin'])) {
      $config['Plugin'] = array_merge($config['Plugin'], $misp_module_settings);
  } else {
      $config['Plugin'] = $misp_module_settings;
  }
}



?>
