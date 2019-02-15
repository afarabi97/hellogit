export class TotalSystemResources {

    //These fields are not part of the form but they displayed on the componets interface.
    cpuCoresAvailable: number;
    memoryAvailable: number;
    clusterStorageAvailable: number;
    clusterStorageComitted: number;    
    totalCephDrives: number;
    totalCephDrivesErrors: string;
    totalCephDrivesCss: string;
    totalCephDrivesCache: Object;

    constructor(){
        this.reinitalize();
    }

    public reinitalize(){
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;
        this.clusterStorageAvailable = 0;
        this.clusterStorageComitted = 0;
        

        this.totalCephDrives = 0;
        this.totalCephDrivesErrors = "";
        this.totalCephDrivesCss = "";

        this.totalCephDrivesCache = {};
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
     * Calculates the total ceph drives properly.
     * 
     * @param ifaceLength 
     * @param deviceFacts 
     */
    public calculateTotalCephDrives(ifaceLength: number, deviceFacts: Object){            
        this.totalCephDrives = 0;        
        this.totalCephDrivesCache[deviceFacts["hostname"]] = ifaceLength;
        for (let key in this.totalCephDrivesCache){
            this.totalCephDrives += this.totalCephDrivesCache[key];
        }
    }
}