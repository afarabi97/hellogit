Feature: Validate PCAP File Upon Upload
    https://jira.di2e.net/browse/THISISCVAH-11757

    Scenario: Upload non pcap file
        Given I have a non-pcap file
        When I upload the non-pcap file
        Then I should receive a 422 Unprocessable Entity Error
