from models.breakingpoint import BPSettings
from bps_restpy.bps import BPS,pp
import time
import logging
import sys

slot_number = 1
port_list   = [0,1] 
logging.basicConfig(level=logging.INFO)

class BPJob():
    def __init__(self, bpsettings:BPSettings):
        self.bpsettings = bpsettings
    
    def auth(self):
        bps = BPS(self.bpsettings.bphost,self.bpsettings.bpuser,self.bpsettings.bppass)
        bps.login()
        return bps

    def run_test(self):
        test_name = self.bpsettings.bptest
        bps = self.auth()

        logging.info("Load test")
        bps.testmodel.load(test_name)

        logging.info("Reserve ports")
        for p in port_list:
            bps.topology.reserve([{'slot': slot_number, 'port': p, 'group':1}])
        
        try:
            logging.info("Run test and Get Stats:")
            run_test = bps.testmodel.run(modelname=test_name, group=1)
            test_id = run_test["runid"]
            run_id = "TEST-" + str(test_id)
            logging.info(f"Test Run Id: {run_id}")
            
            self.test_results(test_id, run_id, test_name)

        except Exception as e:
            logging.error(f"A test is already running:{e}")
            sys.exit(1)

    def test_results(self, test_id: str, run_id:str, test_name:str):
        bps = self.auth()

        #get the ids for all tests running on breakingpoint
        runningTests_Ids = [test['id'] for test in bps.topology.runningTest.get()] 
        #wait for test to complete
        while run_id in runningTests_Ids:
            run_state =  bps.topology.runningTest.get()[0]

            #log progress if test started
            logging.info(f"progress: {run_state['progress']}, runtime {run_state['runtime']}")
            time.sleep(2)
            #update running tests
            runningTests_Ids = [test['id'] for  test in bps.topology.runningTest.get()] 

        logging.info("~The test finished the execution.")
        results = bps.reports.search(searchString=test_name, limit=5, sort="endTime", sortorder="descending")
        for result in results:
            if result['runid'] == int(test_id):
                logging.info(f"{result['name']} execution duration {result['duration']} ended with status: {result['result']} ")
            else:
                pass

        #unreserve ports
        for p in port_list:
             bps.topology.unreserve([{'slot': slot_number, 'port': p, 'group': 1}])

        bps.logout()

    

