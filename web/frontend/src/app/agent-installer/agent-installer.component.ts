import { Component, OnInit } from '@angular/core';
import { AgentInstallerForm } from './agent-installer.form'
import { Title } from '@angular/platform-browser'
import { AgentInstallerService, WindowsInstallerConfigInterface } from '../agent-installer.service';
import { FormArray, ValidationErrors } from '@angular/forms';
import { checkForSufficientData } from './agent-installer.form'

@Component({
  selector: 'app-agent-installer',
  templateUrl: './agent-installer.component.html',
  styleUrls: ['./agent-installer.component.css']
})
export class AgentInstallerComponent implements OnInit{
  agentInstallerForm: AgentInstallerForm;

  constructor(private titleService: Title,
              private agentInstallerService: AgentInstallerService) {
    this.titleService.setTitle('Agent Installer');
    this.agentInstallerForm = new AgentInstallerForm();
  }

  ngOnInit() {
    this.populateAgentList();
  }

  ngOnChanges() {
    this.agentInstallerForm.targets.valueChanges.subscribe(val => {
      checkForSufficientData(this.agentInstallerForm);
    });
  }

  onChanges() {
  }

  onSubmit() {
  }

  get targets(): FormArray {
    return this.agentInstallerForm.targets;
  }

  populateAgentList() {
    this.agentInstallerService.getAgentInstallerConfigs().subscribe(
      saved_configs => {
        for (let config of saved_configs) {
          this.agentInstallerForm.installer_select.default_options.push({
            value: config,
            label: config['config_name'],
            isSelected: false
          });
        }
      },
      err => {
        console.error("Problem receiving Windows agent installer configurations:", err);
      }
    );
  }

  addTarget() {
    this.agentInstallerForm.addTarget();
    this.ngOnChanges()
  }

  removeTarget(index: number) {
    this.agentInstallerForm.removeTarget(index);
    this.ngOnChanges()
  }

}
