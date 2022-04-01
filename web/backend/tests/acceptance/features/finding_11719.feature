Feature: Virtual MIP is not removed from ESXi server when it is deleted during the provision stage on the MIP Management page
    Ticket: https://jira.di2e.net/browse/THISISCVAH-11719

    Rule: Deleting a MIP removes it from the ESXi server

        Scenario Outline: I delete a MIP
            Given A virtual provisioning MIP
            When I delete the MIP
            And I wait a minute
            Then the MIP is not found on the ESXI server
