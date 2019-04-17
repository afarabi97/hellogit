export const PERCENT_PLACEHOLDER: string = "Enter a percentage between 1 and 99. The default is 90.";
export const PERCENT_INVALID_FEEDBACK: string = 'Value must be between 1 and 100.';
export const MIN_ONE_INVALID_FEEDBACK: string = 'Enter a valid integer 1 or greater.';
export const MIN_ZERO_INVALID_FEEDBACK: string = 'Enter a valid integer 0 or greater.';
export const MIN_TWO_INVALID_FEEDBACK: string = 'Enter a valid integer 2 or greater.';
export const MIN_THREE_INVALID_FEEDBACK: string = 'Enter a valid integer 3 or greater.';
export const MIN_EIGHT_INVALID_FEEDBACK: string = 'Enter a valid integer 8 or greater.';
export const INVALID_FEEDBACK_INTERFACE: string = 'No interfaces found! Are you sure you have a second eligible interface that is not the management interface?';
export const INVALID_FEEDBACK_IP: string = 'You must enter a valid IP address.';


//Constraints
export const CONSTRAINT_MIN_ONE: string = '^[1-9]|[0-9]\\d+$';
export const CONSTRAINT_MIN_TWO: string = '^[2-9]|[0-9]\\d+$';
export const CONSTRAINT_MIN_THREE: string = '^[3-9]|[0-9]\\d+$';
export const CONSTRAINT_MIN_EIGHT: string = '^[8-9]|[0-9]\\d+$';
export const CONSTRAINT_MIN_ZERO: string = '^[0-9]|[0-9]\\d+$';
export const PERCENT_MIN_MAX: string = '^([1-9]|[1-9][0-9]|100)$';
export const IP_CONSTRAINT: string = "^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((25[0-4])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))$";
export const HOST_CONSTRAINT = "^[a-zA-Z]([a-zA-Z]|[0-9]|[-])*$"
export const IP_CONSTRAINT_WITH_SUBNET: string = "((^|\\.)((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){4}$";
export const URL_CONSTRAINT: string = "^(ftp:\\/\\/.|http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?\\.iso$";
export const NON_ISO_URL_CONSTRAINT: string = "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$"
export const CIDR_CONSTRAINT: string = "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[0-9])";
export const KUBE_CIDR_CONSTRAINT: string = '^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((2[0-3]\\d)|(1\\d\\d)|([1-9]?\\d))$';

export const EXPLANATION: string = " Kubernetes will \
not cap the performance of the resource at the specified number of cores - it will \
guarentee that amount of compute resource is available if the application needs it. For example, \
if Bro were set to 60%, it is guarenteed to have at least 60% of the server available \
to it. However, if it were only using 30% and something else needed 60%, the other \
thing would be allowed to infringe on Bro's guarenteed resources. If Bro's needs suddenly grew and it \
required the compute resources given out to the other thing, Kubernetes would \
throttle the other thing and Bro would be allowed to burst up to 60% while the other thing \
would be throttled to whatever its resource request is. Basically, this allows everything \
to take whatever it needs at any given time if the sensor is not resource constrained. \
If the sensor becomes resource constrained, each thing will be limited to what it \
requested. See resource requests: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/ and https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/."

export const DESC_ROOT_PASSWORD: string = "The root password will be how to log into each node after the kickstart process completes.  \
                                   Do not forget this password or you will not be able to complete the system installation.";


//INVALID FEEDBACK
export const INVALID_PASSWORD_MISMATCH: string = "The passwords you entered do not match.  Please retype them carefully.";

//MISC CONSTANTS
export const WHAT_IS_CEPH = {"label": "What is Ceph?", "description": "Ceph is what is called a \
  clustered storage solution. Ceph allows \
  us to take a hard drive on an individual machine and add it to a Ceph cluster. \
  Instead of that hard drive only being attached to the machine on which it physically \
  resides, it is effectively added to a singular \"mega hard drive\" which is spread \
  across multiple devices. Kubernetes can then create what are called persistent \
  volumes from the space allocated from this hard drive. A persistent volume acts \
  like a hard drive attached to a single Docker Container. For example, you might have \
  a persistent volume of 8 GB attached to an Elasticsearch instance. If that instance \
  of Elasticsearch dies for whatever reason, Kubernetes creates another identical \
  instance and reattaches the persistent volume containing the Elasticsearch data. \
  In this way, containers can die, migrate, or be manipulated without loss of data."}


export const HELP_ME_DECIDE = {"label": "Help me decide", "description": "If you plan to have a high volume \
  of input traffic to the kit, typically more than 1 Gb/s, it's typically better to go with \"Use hard drive for PCAP storage\"\
  storage, but that assumes a 1Gb/s network backbone. If you have a faster backbone, than it's really \
  a bit of a judgement call. The bottleneck is typically the network backbone. When \
  you have all that PCAP coming in, parts must traverse the network if you are using \
  clustered storage. This can frequently overwhelm a 1Gb/s pipe. If you are on a slower \
  network, it's better to use Ceph because you get all the benefits of a clustered \
  storage solution. If you don't know, it's better to stick with \"Use hard drive for PCAP storage\""};

// MISC
export const CEPH_DRIVE_MIN_COUNT: number = 2;

export const TIMEZONES = [  
  'UTC',
  'Browser',
  'America/Chicago',
  'America/Denver',
  'America/Detroit',
  'America/Los_Angeles',
  'America/New_York'
];

export const KIT_ID = "kit_form";
export const PORTAL_ID = 'portal_links';
export const KICKSTART_ID = "kickstart_form";
export const CTRL_SELECTED = "A controller interface must first be selected.";
export const SENSOR_APPS = ["bro", "suricata", "moloch"];
export const GENERAL_KIT_FAILURE_MSG = 'Kit failed to generate Kit inventory file for an unknown reason. Please check the logs files located in /var/log/tfplenum for more details.';
