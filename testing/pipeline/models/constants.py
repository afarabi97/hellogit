from collections import namedtuple

class SubCmd:
    # Top Level commands
    acceptance_tests = 'acceptance-tests'
    add_node = 'add-node'
    build_manifest = 'build-manifest'
    build_server_for_export = 'build-server-for-export'
    checkout_latest_code = 'checkout-latest-code'
    deploy_kit = 'deploy-kit'
    gip_setup = 'gip-setup'

    run_bp = 'run-bp'
    run_catalog = 'run-catalog'
    run_cleanup = 'run-cleanup'
    run_disk_fillup_tests = 'run-disk-fillup-tests'
    run_export = 'run-export'
    run_integration_tests = 'run-integration-tests'
    run_kit_settings = 'run-kit-settings'
    run_mandiant = 'run-mandiant'
    run_oscap_scans = 'run-oscap-scans'
    run_remote_node= 'run-remote-node'

    setup_baremetal_ctrl = 'setup-baremetal-controller'
    setup_control_plane = 'setup-control-plane'
    setup_ctrl = 'setup-controller'
    setup_kali = 'setup-kali'
    setup_remnux = 'setup-remnux'
    simulate_power_failure = 'simulate-power-failure'

    test_server_repository_vm = 'test-server-repository-vm'
    verify_manifest = 'verify-manifest'
    manifest_file = 'manifest.yaml'

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
    add_docs_to_controller = 'add-docs-to-controller'
    check_master_drive_hashes = 'check-master-drive-hashes'
    create_drives = 'create-drives'
    update_drives = 'update-drives'
    create_master_drive_hashes = 'create-master-drive-hashes'
    export_ctrl = 'export-ctrl'
    export_gip_service_vm = 'export-gip-service-vm'
    export_html_docs = 'export-html-docs'
    export_mip_ctrl = 'export-mip-ctrl'
    export_reposync_server = 'export-reposync-server'
    export_single_page_pdf = 'export-single-page-pdf'
    set_perms = 'set-perms'
    unset_perms = 'unset-perms'

    # gip-setup subcommands
    create_gip_service_vm = 'create-gip-service-vm'
    run_gip_kickstart = 'run-gip-kickstart'
    run_gip_kit = 'run-gip-kit'

class StigSubCmd:
    # Ran when system_name is GIP but we want
    # to Secure The  GIP Services VM
    GIPSVC = 'SERVICES'
    # Ran when system_name is REPO but we want
    RHEL_REPO_SERVER = 'SERVER'
