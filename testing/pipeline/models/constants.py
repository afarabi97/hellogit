from collections import namedtuple

Command = namedtuple('Command', 'name id')

class SubCmd:
    # Top Level commands
    setup_ctrl = 'setup-controller'
    setup_baremetal_ctrl = 'setup-baremetal-controller'
    run_kickstart = 'run-kickstart'
    run_kit = 'run-kit'
    run_catalog = 'run-catalog'
    run_bp = 'run-bp'
    run_integration_tests = 'run-integration-tests'
    simulate_power_failure = 'simulate-power-failure'
    run_unit_tests = 'run-unit-tests'
    checkout_latest_code = 'checkout-latest-code'

    run_export = 'run-export'

    run_cleanup = 'run-cleanup'

    gip_setup = 'gip-setup'

    test_server_repository_vm = 'test-server-repository-vm'
    test_workstation_repository_vm = 'test-workstation-repository-vm'
    build_server_for_export = 'build-server-for-export'
    build_workstation_for_export = 'build-workstation-for-export'
    run_stigs = 'run-stigs'
    create_nightly = 'create_nightly'

    # run-catalog subcommands
    install = "install"
    uninstall = "uninstall"
    reinstall = "reinstall"

    suricata = "suricata"
    moloch_capture = "moloch-capture"
    moloch_viewer = "moloch-viewer"
    zeek = "zeek"
    logstash = "logstash"
    wikijs = "wikijs"
    misp = "misp"
    hive = "hive"
    cortex = "cortex"
    rocketchat = "rocketchat"

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
    export_reposync_workstation = 'export-reposync-workstation'
    create_master_drive = 'create-master-drive'
    create_master_drive_hashes = 'create-master-drive-hashes'
    check_master_drive_hashes = 'check-master-drive-hashes'
    export_minio = Command('minio', 'export-minio')

    # mip subcommands
    run_mip_kickstart = 'run-mip-kickstart'
    run_mip_config = 'run-mip-config'
    save_kit = 'save-kit'

    # gip-setup subcommands
    create_gip_service_vm = 'create-gip-service-vm'
    setup_gip_ctrl = 'setup-gip-controller'
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
    # to secure either the Workstation or Server
    RHEL_REPO_WORKSTATION = 'WORKSTATION'
    RHEL_REPO_SERVER = 'SERVER'
