import { FormGroup } from "@angular/forms";

export class TotalServerResources extends FormGroup {

    //These fields are not part of the form but they displayed on the componets interface.
    cpuCoresAvailable: number;
    memoryAvailable: number;
    clusterStorageAvailable: number;

    //Cached that holds the current cluster storage on a per hostname basis.
    serverDriveStorageCache: Object;    

    assignedLogstashCpus: number;
    logstashCss: string;
    logstashErrorText: string;
    
    elasticSearchMemCss: string;    
    assignedElasicSearchMemory: number;

    constructor(){
        super({}, null, null);
        this.initalize();                
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {        
    }

    private initalize(){
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;
        this.clusterStorageAvailable = 0;

        this.serverDriveStorageCache = {};
        this.assignedLogstashCpus = 0;
        this.logstashCss = "";
        this.logstashErrorText = "";

        this.assignedElasicSearchMemory = 0;        
    }

    /**
     * Overridden method
     */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({});
        this.initalize();
    }

    /**
     * Called when a user clicks on the "Gather Facts" button on a given sensor or server
     * 
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public setFromDeviceFacts(deviceFacts: Object) {
        this.cpuCoresAvailable += deviceFacts["cpus_available"];
        this.memoryAvailable += deviceFacts["memory_available"];
    }

    /**
     * Called when we remove a sensor or server from the kit inventory list.
     * 
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public subtractFromDeviceFacts(deviceFacts: Object){
        if (deviceFacts){
            if (this.cpuCoresAvailable > 0){
                this.cpuCoresAvailable -= deviceFacts["cpus_available"];
            }
            
            if (this.memoryAvailable > 0){
                this.memoryAvailable -= deviceFacts["memory_available"];
            }
        }
    }

    /**
     * Subtracts the GBs from the selected sensorDriveStorageCache from the cache
     * and then sets the cache to for a specific host to 0.
     * 
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public removeClusterStorage(deviceFacts: Object){
        if (this.serverDriveStorageCache[deviceFacts["hostname"]] != undefined){
            if (this.clusterStorageAvailable > 0){
                this.clusterStorageAvailable -= this.serverDriveStorageCache[deviceFacts["hostname"]];
            }
        }
        this.serverDriveStorageCache[deviceFacts["hostname"]] = 0;
    }

    /**
     * Calulates and stores the cluster storage based on what the user selected 
     * and the passed in deviceFacts object .
     * 
     * @param drivesSelected - An array of drives that have been selected
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public calculateClusterStorageAvailable(drivesSelected: Array<string>, deviceFacts: Object){
        this.removeClusterStorage(deviceFacts);

        for (let drive of drivesSelected){
            for (let clusterDrive of deviceFacts["disks"]) {
                if (drive === clusterDrive["name"]){                                        
                    this.serverDriveStorageCache[deviceFacts["hostname"]] += clusterDrive["size_gb"];
                }
            }
        }
        this.clusterStorageAvailable += this.serverDriveStorageCache[deviceFacts["hostname"]];
    }
}