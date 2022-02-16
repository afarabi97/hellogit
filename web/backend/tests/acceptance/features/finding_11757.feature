Feature: Validate PCAP File Upon Upload
    Ticket:     https://jira.di2e.net/browse/THISISCVAH-11757
    Test:       https://jira.di2e.net/browse/THISISCVAH-11981
    Finding:    https://jira.di2e.net/browse/THISISCVAH-12003

    Scenario Outline: Uploading A File To The PCAP Endpoint
        Given I have a <file_type> file that is <valid_or_invalid> and named <upload_file_name>
        When I try to upload the file
        Then The message must say <message>
        And The status code must be <status_code>
        And After being saved the md5hash should remain the same

        Examples:
        |   file_type   |   valid_or_invalid    |   upload_file_name    |   message                                             |   status_code     |
        |   pcap        |   invalid             |   test_invalid.pcap   |   Failed to upload file. Not a valid pcap file.       |   422             |
        |   pcapng      |   valid               |   test_pcapng.pcap    |   Failed to upload file. Not a valid pcap file.       |   422             |
        |   pcap        |   valid               |   testpcap            |   Successfully uploaded testpcap.pcap!                |   200             |
