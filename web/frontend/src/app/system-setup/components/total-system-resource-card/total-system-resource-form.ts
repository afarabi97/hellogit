export class TotalSystemResources {

    //These fields are not part of the form but they displayed on the componets interface.
    cpuCoresAvailable: number;
    memoryAvailable: number;
    clusterStorageAvailable: number;
    clusterStorageComitted: number;

    constructor(deviceFacts?){
        this.reinitalize();
        if (deviceFacts) {
            this.setFromDeviceFacts(deviceFacts);
        }
    }

    public reinitalize(){
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;
        this.clusterStorageAvailable = 0;
        this.clusterStorageComitted = 0;
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
}