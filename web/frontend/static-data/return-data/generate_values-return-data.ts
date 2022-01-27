export const GenerateValues: Object[] = [
  {
    server: {
      elastic_image: 'elasticsearch/elasticsearch:7.16.2',
      cortex_image: 'tfplenum/cortex:3.1.1-1',
      python_image: 'tfplenum/python:3.9.0',
      cortex_port: 9001,
      nginx_image: 'nginx:1.20.1',
      elastic_port: 9200,
      superadmin_username: 'cortex_admin',
      superadmin_password: 'Password!123456',
      org_name: 'thehive',
      org_admin_username: 'admin_thehive',
      org_admin_password: 'Password!123456',
      org_user_username: 'user_thehive',
      misp_user: 'user_misp',
      domain: 'fake',
      auth_base: 'https://controller.fake/auth/realms/CVAH-SSO',
      serviceNode: true,
      node_hostname: 'server',
      deployment_name: 'cortex'
    }
  }
];
