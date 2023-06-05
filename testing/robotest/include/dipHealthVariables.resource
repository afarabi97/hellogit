*** Variables ***
${locNodeTableRows}             xpath=//cvah-health-dashboard-node-table//tbody/tr

${locPodTableExpand}            xpath=//cvah-health-dashboard-pod-table//tbody/tr/td[1]/span[1]
${locPodNameTmpl}               xpath=//cvah-health-dashboard-pod-table//table/tbody/tr/td[contains(text(), "~")]