# How to use Validation

How to use form validation:
The following is an object that has key value pair, where value is an array of validation objects and the key is the formcontrolName. The validation objects in the array are the following:
 {ops: any, error_message: string, validatorFn: string}

ops - ops refers to optional params. Here you can add anything you want that you might need.
error_message - the error message that will be displayed in the mat-error for that particular validation object.
However, some validation functions have multiple errors, so those will be returned accordingly (ex. validatorFn = ip&subnet )
validatorFn -  this is the validation function you want to call. Currently the string is used in a switch to determine which validation function can be used
the following are the avaliable options:

1. pattern - {ops: {patter: /some_pattern/}, error_message: some_error_message, validatorFn: 'pattern'}
2. unique - {error_message: some_error_message, validatorFn: 'unique'} ----- this requires an array to be added to ops in the formcontrol example:
             let nodes = this.kickStartFormGroup.get('nodes');
             formbuilder.group({
                 hostname: new FormControl('', Validators.compose([validateFromArray(kickstart_validators.hostname, { uniqueArray: nodes, formControlName: 'hostname' })]))
             });
3. ip&subnet - { ops: { ip_range: [{ value: formControlName, label: 'Start Range' }] }, error_message: (value) => `${value} is not in the correct range.`, validatorFn: 'ip&subnet' }
               You can add more values to ip_range. the validator function will basically test against these. in the example above, value: formControlName,
               is the value/input field's formControlName you want to test your value against.

4. required - { error_message: some_error_message, validatorFn: 'required' }

5. minInArray - {ops: {minRequred: number, minRequiredValue: value, minRequiredArray: formArray, minRequiredControl: controlName }, error_message: some_error_message, validatorFn: 'minInArray'}
                minRequired - the number of required values in the array, example: if you need for at least one to be true then this will be 1
                minRequiredValue - the value that the min has to be, example: if you need for at least one to be true then this will be true
                minRequiredArray: - the formarray that the validatorFunction will test against
                minRequireControl: - the control inside the elements of the formarray, example if you need for at least one is_master_server to be true, then this will be is_master_server
         Notes: for minInArray, its a lot easier to add this validator to the formGroup directly contianing the formArray, the followwing is an example of how to do this along with multiple minInArray :
                    // in component.ts
                     kitFormGroup = this.formBuilder.group({
                         nodes: this.formBuilder.array([
                              this.formBuilder.group({
                                 node_type: new FormControl(''),
                                 is_master_server: new FormControl('')
                              })
                        ])
                     })
                    kitFormGroup.setValidators(Validators.compose([
                      validateFromArray(kit_validators.kit_form_one_master, { minRequired: 1, minRequiredValue: true, minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'is_master_server' }),
                      validateFromArray(kit_validators.kit_form_one_sensor, { minRequired: 1, minRequiredValue: 'Sensor', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
                      validateFromArray(kit_validators.kit_form_one_server, { minRequired: 1, minRequiredValue: 'Server', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
                    ]));
                  // in your enums.ts or form.ts
                     kit_validators = {
                      kit_form_one_server: [
                          { error_message: kit_validator_error_messages.at_least_one_server, validatorFn: 'minInArray' }
                      ],
                      kit_form_one_sensor: [
                          { error_message: kit_validator_error_messages.at_least_one_sensor, validatorFn: 'minInArray' }
                      ],
                      kit_form_one_master: [
                         { error_message: kit_validator_error_messages.at_least_one_master_server, validatorFn: 'minInArray' }
                      ]]

the following is an example of a field that has unique, ip&subnet, required, and pattern
             // in the compoenent.ts
             let nodes = this.kickStartFormGroup.get('nodes');
             formbuilder.group({
                ip_address: new FormControl('', Validators.compose([validateFromArray(kickstart_validators.ip_address, { uniqueArray: nodes, formControlName: 'ip_address', parentFormGroup: this.kickStartFormGroup })])),
             });
             // in your validator enums.ts
              ip_address: [
                  { error_message: (value) => `Duplicate IP Address found: ${value}. Node must have a unique IP Address.`, validatorFn: 'unique' },
                  { ops: { ip_range: [{ value: 'dhcp_start', label: 'DHCP Start Range' }, { value: 'dhcp_end', label: 'DHCP End Range' }] }, error_message: (value) => `${value} is not in the correct range.`, validatorFn: 'ip&subnet' },
                  { error_message: 'IP Address is required', validatorFn: 'required' },
                  { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
              ]
