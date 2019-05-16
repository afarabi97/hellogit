tfplenum-integration-testing

## Testy-Tester Flags
```
-p --path               Path to VMs yaml
--run-all               Run all stages
--setup-controller      Creates a controller VM and runs bootstrap
--run-kickstart         Creates sensors/server VMs and kickstarts them
--run-kit               Deploys tfplenum to kit
--run-integration-tests Runs integration testing playbook
--headless              Runs selenium in headless mode (required when not using a desktop/gui)
-du                     DI2E Username
-dp                     DI2E Password
-vu                     VCenter Username
-vp                     VCenter Password
--tfplenum-commit-hash
--tfplenum-deployer-commit-hash
```

## Example Commands
## Building A Controller
```
python36 main.py --setup-controller --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}
```

## Running Kickstart
```
python36 main.py --run-kickstart --headless --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}
```

## Running Kickstart
```
python36 main.py --run-kickstart --headless --path testy-tester/testcases/${kit} -du ${di2e_username} -dp ${di2e_password} -vu ${vcenter_username} -vp ${vcenter_password}
```
