import { FormGroup } from "@angular/forms";

import { HtmlInput } from '../html-elements';
import { PERCENT_PLACEHOLDER, PERCENT_MIN_MAX, PERCENT_INVALID_FEEDBACK          
 } from '../frontend-constants';

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
        super.addControl('elastic_cpu_percentage', this.elastic_cpu_percentage);
        super.addControl('elastic_memory_percentage', this.elastic_memory_percentage);
        super.addControl('logstash_cpu_percentage', this.logstash_cpu_percentage);
        super.addControl('elastic_storage_percentage', this.elastic_storage_percentage);
        super.addControl('elastic_curator_threshold', this.elastic_curator_threshold);
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.elastic_cpu_percentage.disable();
        this.elastic_memory_percentage.disable();
        this.logstash_cpu_percentage.disable();
        this.elastic_storage_percentage.disable();
        this.elastic_curator_threshold.disable();
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
        super.reset({
            'elastic_cpu_percentage': this.elastic_cpu_percentage.default_value,
            'elastic_memory_percentage': this.elastic_memory_percentage.default_value,
            'logstash_cpu_percentage': this.logstash_cpu_percentage.default_value,
            'elastic_storage_percentage': this.elastic_storage_percentage.default_value,
            'elastic_curator_threshold': this.elastic_curator_threshold.default_value,
        });
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

    elastic_cpu_percentage = new HtmlInput(
        'elastic_cpu_percentage',
        'Elasticsearch CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server CPUs which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- CPUs here does not mean dedicated CPUs. \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        CPU you want going to Elasticsearch."
    )

    elastic_memory_percentage = new HtmlInput(
        'elastic_memory_percentage',
        'Elasticsearch RAM %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        "90",
        "This is the percentage of server RAM which the system will dedicated to \
        Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- \
        This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
        What this means is that Elasticsearch pods will have a request of \
        X value for the server's compute power. If Elasticsearch is using less than this, \
        other devices can use those resources. However, when under load, Elasticsearch is \
        guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
        Basically, you can think of this as a simple percentage of how much of the server\'s \
        RAM you want going to Elasticsearch."
    )

    logstash_cpu_percentage = new HtmlInput(
        'logstash_cpu_percentage',
        'Logstash Servers CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '10',
        "The Percentage of the server CPU resources which will be dedicated to logstash. \
        This is a percentage of the total server \
        resources divided by the number of servers."
    )

    elastic_storage_percentage = new HtmlInput (
        'elastic_storage_percentage',
        'ES Storage Space %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '80',
        "The percentage of CEPH storage space allocated to Elasticsearch.  \
        We recommend a large percentage of the CEPH pool be allocated to this.  \
        For example, if a CEPH pool has 100 GB allocated to it, 80% will take 80 \
        GB of the 100 GB capacity"
    )

    elastic_curator_threshold = new HtmlInput(
        'elastic_curator_threshold',
        'ES Curator Threshold %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '90',
        "The percentage of maximum allocated space for Elasticsearch that can be filled \
        before Curator begins deleting indices. The oldest Moloch, Bro, etc, indices that exceed \
        this threshold will be deleted first."
    )
}