<?php
$config['MISP']['language']= 'eng';
$config['MISP']['live']= true;
$config['MISP']['baseurl']= $_SERVER['BASE_URL'];
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

?>
