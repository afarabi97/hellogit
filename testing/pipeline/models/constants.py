from collections import namedtuple

Command = namedtuple('Command', 'name id')

class SubCmd:
    # Top Level commands
    setup_ctrl = 'setup-controller'
    setup_baremetal_ctrl = 'setup-baremetal-controller'
    run_kit_settings = 'run-kit-settings'
    setup_control_plane = 'setup-control-plane'
    add_node = 'add-node'
    deploy_kit = 'deploy-kit'

    run_catalog = 'run-catalog'
    run_bp = 'run-bp'
    run_verodin = 'run-verodin'
    run_integration_tests = 'run-integration-tests'
    simulate_power_failure = 'simulate-power-failure'
    run_unit_tests = 'run-unit-tests'
    checkout_latest_code = 'checkout-latest-code'
    run_remote_node= 'run-remote-node'
    run_export = 'run-export'

    run_cleanup = 'run-cleanup'
    gip_setup = 'gip-setup'

    test_server_repository_vm = 'test-server-repository-vm'
    build_server_for_export = 'build-server-for-export'
    run_stigs = 'run-stigs'
    run_robot = 'run-robot'
    run_oscap_scans = 'run-oscap-scans'

    # run-catalog subcommands
    install = "install"
    uninstall = "uninstall"
    reinstall = "reinstall"

    suricata = "suricata"
    arkime_capture = "arkime-capture"
    arkime_viewer = "arkime-viewer"
    zeek = "zeek"
    logstash = "logstash"
    wikijs = "wikijs"
    misp = "misp"
    hive = "hive"
    cortex = "cortex"
    rocketchat = "rocketchat"
    mattermost = "mattermost"
    nifi = "nifi"
    redmine = "redmine"
    netflow_filebeat = "netflow-filebeat"

    # run-export subcommands
    export_html_docs = 'export-html-docs'
    export_single_page_pdf = 'export-single-page-pdf'
    add_docs_to_controller = 'add-docs-to-controller'
    set_perms = 'set-perms'
    unset_perms = 'unset-perms'
    export_ctrl = 'export-ctrl'
    export_mip_ctrl = 'export-mip-ctrl'
    export_gip_service_vm = 'export-gip-service-vm'
    export_reposync_server = 'export-reposync-server'
    create_master_drive = 'create-master-drive'
    create_master_drive_hashes = 'create-master-drive-hashes'
    check_master_drive_hashes = 'check-master-drive-hashes'
    export_minio = Command('minio', 'export-minio')

    # gip-setup subcommands
    create_gip_service_vm = 'create-gip-service-vm'
    run_gip_kickstart = 'run-gip-kickstart'
    run_gip_kit = 'run-gip-kit'
    minio_command = 'minio'
    # minio subcommands
    setup_minio = Command('create', 'setup-minio')
    create_certificate_minio = Command('create-certificate', 'create-certificate-minio')

class StigSubCmd:
    # Ran when system_name is GIP but we want
    # to Secure The  GIP Services VM
    GIPSVC = 'SERVICES'
    # Ran when system_name is REPO but we want
    RHEL_REPO_SERVER = 'SERVER'

class RobotSubCmd:
    tfplenum_robot_container = '--tfplenum-robot-container'
    jira_username = '--tfplenum-robot-container'
    jira_password = '--jira-password'
    jira_report = '--jira-report'
    jira_project_version = '--jira-project-version'
    jira_project_key = '--jira-project-key'
    robot_browser = '--robot-browser'
    robot_category = '--robot-category'
    robot_variables = '--robot-variables'
