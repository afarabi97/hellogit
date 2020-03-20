
class SubCmd:
    setup_ctrl = 'setup-controller'
    run_kickstart = 'run-kickstart'
    run_kit = 'run-kit'
    run_catalog = 'run-catalog'
    run_integration_tests = 'run-integration-tests'
    simulate_power_failure = 'simulate-power-failure'
    run_unit_tests = 'run-unit-tests'
    run_export = 'run-export'
    run_cleanup = 'run-cleanup'

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

    publish = 'publish'
