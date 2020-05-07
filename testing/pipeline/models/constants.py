
class SubCmd:
    # Top Level commands
    setup_ctrl = 'setup-controller'
    run_kickstart = 'run-kickstart'
    run_kit = 'run-kit'
    run_catalog = 'run-catalog'
    run_integration_tests = 'run-integration-tests'
    simulate_power_failure = 'simulate-power-failure'
    run_unit_tests = 'run-unit-tests'
    run_export = 'run-export'
    run_cleanup = 'run-cleanup'
    gip_setup = 'gip-setup'
    create_rhel_repository_vm = 'create-rhel-repository-vm'
    create_workstation_repository_vm = 'create-workstation-repository-vm'

    # run-catalog subcommands
    suricata = "suricata"
    moloch_capture = "moloch-capture"
    moloch_viewer = "moloch-viewer"
    zeek = "zeek"
    logstash = "logstash"

    # run-export subcommands
    export_html_docs = 'export-html-docs'
    export_single_page_pdf = 'export-single-page-pdf'
    add_docs_to_controller = 'add-docs-to-controller'
    set_perms = 'set-perms'
    unset_perms = 'unset-perms'
    export_ctrl = 'export-ctrl'
    generate_versions_file = 'generate-versions-file'
    create_master_drive = 'create-master-drive'
    export_mip_ctrl = 'export-mip-ctrl'
    export_gip_service_vm = 'export-gip-service-vm'

    # mip subcommands
    run_mip_kickstart = 'run-mip-kickstart'
    run_mip_config = 'run-mip-config'

    # Gip subcommands
    create_gip_service_vm = 'create-gip-service-vm'
    setup_gip_ctrl = 'setup-gip-controller'
    run_gip_kickstart = 'run-gip-kickstart'
    run_gip_kit = 'run-gip-kit'
