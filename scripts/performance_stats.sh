#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
SURICATA_SENSOR=$(kubectl get pods | grep -v filebeat | grep suricata |cut -d " " -f 1)
ZEEK_SENSOR=$(kubectl get pods | grep zeek |cut -d " " -f 1)
MOLOCH_SENSOR=$(kubectl get pods | grep arkime | grep -v viewer |cut -d " " -f 1)
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin"

NODES=$(kubectl get nodes -o jsonpath='{.items..metadata.name}')
SENSOR_NAME=$(kubectl get nodes --selector=role=sensor -o jsonpath='{.items..metadata.name}')
#NODES=$(cat /etc/hosts | grep -e server -e sensor | sort | awk '{ print $3 }')
#SENSOR_NAME=$(cat /etc/hosts | grep sensor | sort | awk '{ print $3 }')

ELASTIC_SECRET=$(kubectl get secret tfplenum-es-elastic-user -o jsonpath='{.data.elastic}' | base64 -d)
#DOMAIN=$(hostnamectl | grep controller | cut -d "." -f2)
DOMAIN=$(kubectl get nodes | grep Ready | head -n1 | awk '{print $1}' | cut -d. -f2)

if [ -z "$LOG_DIR" ]; then
    LOG_DIR="/opt/tfplenum/logs"
fi

pushd $SCRIPT_DIR > /dev/null

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

function prompt_runtype() {
    echo "Select stats type:"
    echo "All: This will output all stats"
    echo "Suricata: Suricata stats"
    echo "Zeek: Zeek stats"
    echo "IOPs: IOPs stats"
    echo "Memory usage: Memory stats"
    echo "CPU usage: CPU stats"
    echo "Node usage: Node stats"
    echo "Arkime usage: Arkime stats"
    echo "Elastic usage: Elastic stats"
    echo "NIC usage: NIC sensor stats"
    echo "Filebeat usage: Filebeat stats"
    if [ -z "$RUN_TYPE" ]; then
        select cr in "All" "Suricata" "Zeek" "IOPs" "Memory usage" "CPU usage" "Node usage" "Arkime usage" "Elastic usage" "NIC usage" "Filebeat usage"; do
            case $cr in
                All ) export RUN_TYPE=all; break;;
                Suricata ) export RUN_TYPE=suricata; break;;
                Zeek ) export RUN_TYPE=zeek; break;;
                IOPs ) export RUN_TYPE=iops; break;;
                "Memory usage" ) export RUN_TYPE=memoryusage; break;;
                "CPU usage" ) export RUN_TYPE=cpuusage; break;;
                "Node usage" ) export RUN_TYPE=nodeusage; break;;
                "Arkime usage" ) export RUN_TYPE=molochusage; break;;
                "Elastic usage" ) export RUN_TYPE=elasticusage; break;;
                "NIC usage" ) export RUN_TYPE=nicusage; break;;
                "Filebeat usage" ) export RUN_TYPE=filebeatusage; break;;
            esac
        done
    fi
}

function redo_logs() {
    echo $LOG_DIR
    rm -rf $LOG_DIR
    mkdir $LOG_DIR
}


function exec_container() {
    run_cmd kubectl exec -it sensor1-suricata-dd47b68d6-bgxlz /bin/bash
}

function suricata_get_file() {
    echo "suricata_get_file"
    for SURICATA_NAME in $SURICATA_SENSOR
    do
        echo $SURICATA_NAME
        kubectl exec -it $SURICATA_NAME -- bash -c "cat /var/log/suricata/stats.log" > $LOG_DIR/stats_${SURICATA_NAME}.log
    done
}

function suricata_pull_stats() {
    echo "suricata_pull_stats"
    for SURICATA_NAME in $SURICATA_SENSOR
    do
        run_cmd tail -n 50 $LOG_DIR/stats_${SURICATA_NAME}.log > $LOG_DIR/final_report_${SURICATA_SENSOR}.log
    done
}

function zeek_check_packet_loss() {
    echo "check_packet_loss"
    if [[ $RESULT -eq 0 ]];then
    for ZEEK_NAME in $ZEEK_SENSOR
    do
        PACKET_LOSS=$(kubectl exec -it $ZEEK_NAME -c logger-0 -- bash -c "cat capture*" | jq '.' | grep percent_lost | cut -d ":" -f 2)
        ZEEK_PACKET_LOSS+=($PACKET_LOSS)
    done
    fi
}

function zeek_check_file() {
    echo "check_file"
    for ZEEK_NAME in $ZEEK_SENSOR
    do
        run_cmd kubectl exec -it $ZEEK_NAME -c logger-0 -- bash -c "ls | grep capture" &>/dev/null
        if [[ $? -eq 0 ]];then
            RESULT=0
        else
            RESULT=127
            break
        fi
    done
}

function zeek_get_file() {
    echo "zeek_get_file"
    for ZEEK_NAME in $ZEEK_SENSOR
    do
        echo $ZEEK_NAME
        kubectl exec -it $ZEEK_NAME -c logger-0 -- bash -c "cat capture*" > $LOG_DIR/zeek_capture_loss_${ZEEK_NAME}.log
        kubectl exec -it $ZEEK_NAME -c logger-0 -- bash -c "cat stats.log" > $LOG_DIR/zeek_stats_${ZEEK_NAME}.log
    done
}

function zeek_packet_loss() {
    echo "packet_loss"
    if [[ $RESULT -eq 0 ]]; then
            for VERIFY_LOSS in "${ZEEK_PACKET_LOSS[@]}"
            do
                RESULT=$(echo "$VERIFY_LOSS > 0.1" | bc)
                if [[ $RESULT -eq 1 ]];then
                    echo "Packet loss is OUT OF RANGE: $VERIFY_LOSS"Catalog
                else
                    echo "Packet loss is within range: $VERIFY_LOSS"
                    fi
            done
    else
        echo "File has not generated yet, try again in a few minutes."
    fi
}

#sysstat package includes iostat
function install_sysstat (){
    echo "install_sysstat"
    for NODE in $NODES
    do
        CHECK_BIN=$(ssh root@$NODE 'ls /usr/bin/ | grep ^iostat')
        if [[ -z $CHECK_BIN ]]; then
            ssh root@$NODE 'yum -y install sysstat &> /dev/null'
        fi
    done
}

function get_iops() {
    echo "get_iops"
     echo "" > $LOG_DIR/iops.log
     for NODE_NAME in $NODES
     do
        echo "-----------------$NODE_NAME---------------------" >> $LOG_DIR/iops.log
        ssh root@$NODE_NAME iostat -dx sda sdb sdc >> $LOG_DIR/iops.log
     done
}

function get_cpu_usage() {
    echo "get_cpu_usage"
     echo "" > $LOG_DIR/cpuusage.log
     for NODE_NAME in $NODES
     do
        echo "-----------------$NODE_NAME---------------------" >> $LOG_DIR/cpuusage.log
        ssh root@$NODE_NAME iostat -c >> $LOG_DIR/cpuusage.log
     done
}

function get_memory_usage() {
    echo "get_memory_usage"
     echo "" > $LOG_DIR/memoryusage.log
     for NODE_NAME in $NODES
     do
        echo "-----------------$NODE_NAME---------------------" >> $LOG_DIR/memoryusage.log
        ssh root@$NODE_NAME free -h >> $LOG_DIR/memoryusage.log
        echo " "
     done
}

function get_node_usage() {
    echo "get_node_usage"
    kubectl get nodes --no-headers | awk '{print $1}' | xargs -I {} sh -c 'echo ""; \
    echo {};kubectl describe node {} | grep Namespace -A 40 | grep -ve Events -ve Total' > $LOG_DIR/nodeusage.log
}

function get_moloch_usage() {
    echo "get_moloch_usage"
    echo "" > $LOG_DIR/moloch_stats.log
    for NODE in $MOLOCH_SENSOR
    do
        MOLOCH_CAPTURE=$(kubectl logs $NODE -c capture | grep packets)
        if [[ -z $MOLOCH_CAPTURE ]]; then
            echo "$NODE isn't currently capturing data!" >> $LOG_DIR/moloch_stats.log
        else
            echo "-----------------$NODE---------------------" >> $LOG_DIR/moloch_stats.log
            kubectl logs $NODE -c capture | grep packets >> $LOG_DIR/moloch_stats.log
        fi
    done
}

function get_elastic_usage() {
    echo "get_elastic_usage"
    echo "" > $LOG_DIR/elastic_stats.log
    echo "-----------------NODES---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_cat/nodes/?v >> $LOG_DIR/elastic_stats.log
    echo "-----------------HEALTH---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_cat/health/?v >> $LOG_DIR/elastic_stats.log
    echo "-----------------INDICES---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_cat/indices/?v >> $LOG_DIR/elastic_stats.log
    echo "-----------------SHARDS---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_cat/shards/?v >> $LOG_DIR/elastic_stats.log
    echo "-----------------THREAD POOL---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_cat/thread_pool/write?v >> $LOG_DIR/elastic_stats.log
    echo "-----------------POLICY---------------------" >> $LOG_DIR/elastic_stats.log
    curl -k -u elastic:$ELASTIC_SECRET https://elasticsearch.$DOMAIN:9200/_ilm/policy/?pretty >> $LOG_DIR/elastic_stats.log
}

function get_nic_usage() {
    echo "get_nic_usage"
    echo "" > $LOG_DIR/nic_stats.log
    for SENSOR in $SENSOR_NAME
    do
        COMMON_KIT_INTERFACE=$(ssh root@$SENSOR 'cat /proc/net/dev | grep enp175s0f1 | cut -d":" -f1')
        LEGACY_KIT_INTERFACE=$(ssh root@$SENSOR 'cat /proc/net/dev | grep p2p4 | cut -d":" -f1')
        DELL_SFF=$(ssh root@$SENSOR 'cat /proc/net/dev | grep em2 | cut -d":" -f1')
        echo "-----------------$SENSOR---------------------" >> $LOG_DIR/nic_stats.log
        if [[ -n $COMMON_KIT_INTERFACE ]];then
            ssh root@$SENSOR "ethtool -S $COMMON_KIT_INTERFACE" >> $LOG_DIR/nic_stats.log
        elif [[ -n $LEGACY_KIT_INTERFACE ]];then
            ssh root@$SENSOR "ethtool -S $LEGACY_KIT_INTERFACE" >> $LOG_DIR/nic_stats.log
        elif [[ -n $DELL_SFF ]];then
            ssh root@$SENSOR "ethtool -S $DELL_SFF" >> $LOG_DIR/nic_stats.log
        else
            echo "You're using the incorrect interface"
        fi
    done
}

filebeat_query(){
    echo "filebeat_query"
    curl -k -u elastic:$ELASTIC_SECRET -H'Content-Type: application/json' "https://elasticsearch.$DOMAIN:9200/.monitoring-beats*/_search/?pretty=true" -d '
    {
    "size": 3,
    "query": {
        "bool": {
        "filter": [
            {
            "term": {
                "beats_stats.beat.name": "'$SENSOR'-suricata"
            }
            }
        ]
        }
    }
    }'
}

function get_filebeats() {
    echo "get_filebeats"
    echo "" > $LOG_DIR/filebeats.log
    for SENSOR in $SENSOR_NAME
    do
        echo "-----------------$SENSOR---------------------" >> $LOG_DIR/filebeats.log
        filebeat_query >> $LOG_DIR/filebeats.log
    done
}

prompt_runtype

if [ "$RUN_TYPE" == "all" ]; then
    redo_logs
    install_sysstat
    get_iops
    get_cpu_usage
    get_memory_usage
    get_node_usage
    get_moloch_usage
    get_elastic_usage
    get_nic_usage
    get_filebeats
    suricata_get_file
    suricata_pull_stats
    # zeek_check_file
    zeek_get_file
    # zeek_check_packet_loss
    zeek_packet_loss
fi

if [ "$RUN_TYPE" == "suricata" ]; then
    suricata_get_file
    suricata_pull_stats
fi

if [ "$RUN_TYPE" == "zeek" ]; then
    # zeek_check_file
    zeek_get_file
    # zeek_check_packet_loss
    zeek_packet_loss
fi

if [ "$RUN_TYPE" == "iops" ]; then
    install_sysstat
    get_iops
fi

if [ "$RUN_TYPE" == "cpuusage" ]; then
    get_cpu_usage
fi

if [ "$RUN_TYPE" == "memoryusage" ]; then
    get_memory_usage
fi

if [ "$RUN_TYPE" == "nodeusage" ]; then
    get_node_usage
fi

if [ "$RUN_TYPE" == "molochusage" ]; then
    get_moloch_usage
fi

if [ "$RUN_TYPE" == "elasticusage" ]; then
    get_elastic_usage
fi

if [ "$RUN_TYPE" == "nicusage" ]; then
    get_nic_usage
fi

if [ "$RUN_TYPE" == "filebeatusage" ]; then
    get_filebeats
fi

popd > /dev/null




