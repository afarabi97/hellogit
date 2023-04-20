import os
import tempfile
import uuid
from datetime import datetime
from io import StringIO, TextIOWrapper
from pathlib import Path
from typing import Dict, List, Tuple, Union
from zipfile import ZipFile

from app.service.job_service import run_command2
from app.utils.collections import mongo_rule, mongo_ruleset
from app.utils.constants import (DATE_FORMAT_STR, PCAP_UPLOAD_DIR, RULE_TYPES,
                                 RULESET_STATES, SURICATA_IMAGE_VERSION,
                                 ZEEK_IMAGE_VERSION, ZEEK_INTEL_PATH,
                                 ZEEK_SCRIPT_DIR, ZEEK_SIG_PATH)
from app.utils.utils import zip_folder
from flask import Response, send_file
from pymongo.results import InsertOneResult

CHUNK_SIZE = 5000000

class InvalidRuleSyntax(Exception):
    pass

class ProhibitedExecFunc(Exception):
    pass


def validate_suricata_rule(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = mongo_rule().find_one({"_id": rule["_id"]})['rule']

        filename = '{}/suricata.rules'.format(tmpdirname)
        if isinstance(the_rule, str):
            with Path(filename).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filename)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/suricata:{}".format(
            SURICATA_IMAGE_VERSION)
        cmd = ("docker run --rm "
               "-v {tmp_dir}:/etc/suricata/rules/ localhost:5000/tfplenum/suricata:{version} "
               "suricata -c /etc/suricata/suricata.yaml -T").format(tmp_dir=tmpdirname,
                                                                    version=SURICATA_IMAGE_VERSION)

        stdout, ret_val = run_command2(pull_docker_cmd)
        if ret_val == 0:
            stdout, ret_val = run_command2(cmd)
            if ret_val == 0:
                return True, ""

    return False, stdout

def validate_zeek_script(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = mongo_rule().find_one({"_id": rule["_id"]})['rule']

        filename = "custom.zeek"
        filepath = '{}/{}'.format(tmpdirname, filename)
        if isinstance(the_rule, str):
            with Path(filepath).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filepath)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
            ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd)
        if ret_val == 0:
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{script_dir} --entrypoint /opt/zeek/bin/zeek "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-S {script_dir}/{file_to_test}").format(tmp_dir=tmpdirname,
                                                            version=ZEEK_IMAGE_VERSION,
                                                            script_dir=ZEEK_SCRIPT_DIR,
                                                            file_to_test=filename)

            stdoutput, ret_val = run_command2(cmd)
            if ret_val == 0:
                return True, ""

    return False, stdoutput


def validate_zeek_intel(rule: Dict) -> Tuple[bool, str]:
    pcap_name = "wannacry.pcap"
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = mongo_rule().find_one({"_id": rule["_id"]})['rule']

        filename = "local.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(
                "@load frameworks/intel/seen\nredef Intel::read_files += { \"/opt/tfplenum/zeek/intel.dat\" };")

        Intel_Name = "intel.dat"
        Intel_Path = '{}/{}'.format(rules_tmp_dir, Intel_Name)
        with Path(Intel_Path).open('w') as fp:
            fp.write(the_rule)
            #"1.2.3.4 Intel::ADDR     source1 Sending phishing email  http://source1.com/badhosts/1.2.3.4\n"
            # "a.b.com Intel::DOMAIN   source2 Name used for data exfiltration -")

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
            ZEEK_IMAGE_VERSION)
        cmd = ("docker run --rm "
               "-v {tmp_dir}/{file_to_test}:{script_dir}/{file_to_test} "
               "-v {tmp_dir}/{Intel_File}:{script_dir}/{Intel_File} "
               "-v {pcap_dir}/{Pcap_Name}:/pcaps/{Pcap_Name} "
               "-w /data/ "
               "--entrypoint /opt/zeek/bin/zeek "
               "localhost:5000/tfplenum/zeek:{version} "
               "-r /pcaps/{Pcap_Name} {script_dir}/{file_to_test}").\
            format(file_to_test=filename,
                   Intel_File=Intel_Name,
                   pcap_dir=PCAP_UPLOAD_DIR,
                   Pcap_Name=pcap_name,
                   script_dir=ZEEK_INTEL_PATH,
                   tmp_dir=rules_tmp_dir,
                   version=ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd)
        if ret_val == 0:
            stdoutput, ret_val = run_command2(cmd)

            if stdoutput == '':
                return True, ""

    return False, stdoutput


def validate_zeek_signature(rule: Dict) -> Tuple[bool, str]:
    with tempfile.TemporaryDirectory() as tmpdirname:
        try:
            the_rule = rule['rule']
        except KeyError:
            the_rule = mongo_rule().find_one({"_id": rule["_id"]})['rule']

        filename = "custom.sig"
        filepath = '{}/{}'.format(tmpdirname, filename)
        if isinstance(the_rule, str):
            with Path(filepath).open('w') as fp:
                fp.write(the_rule)
        else:
            the_rule.save(filepath)
            the_rule.stream.seek(0)

        pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
            ZEEK_IMAGE_VERSION)
        stdoutput, ret_val = run_command2(pull_docker_cmd)
        if ret_val == 0:
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{sig_path} --entrypoint /opt/zeek/bin/zeek "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-s {sig_path}").format(tmp_dir=filepath,
                                           version=ZEEK_IMAGE_VERSION,
                                           sig_path=ZEEK_SIG_PATH)
            stdoutput, ret_val = run_command2(cmd)
            if ret_val == 0:
                return True, ""

    return False, stdoutput

def does_file_have_ext(some_path: str, extension: str) -> bool:
    pos = some_path.rfind(".")
    file_ext = some_path[pos:]
    return file_ext.lower() == extension


def _get_file_header(rule_set: dict, file: TextIOWrapper):
    if rule_set['appType'] == RULE_TYPES[2]:
        header = file.readline()
        return header
    return None


def create_rule_from_file(path: Path, rule_set: Dict, ignore_errors: bool = False, by_pass_validation: bool = False) -> Union[Dict, List[Dict]]:
    # If the file is greater than 5 MB we need to split up the file into smaller pieces
    if path.stat().st_size > CHUNK_SIZE:
        partial_rule = StringIO()
        count = 1
        ret_val = []
        with path.open() as f:
            header = _get_file_header(rule_set, f)
            for line in f.readlines():
                partial_rule.write(line)
                if partial_rule.tell() >= CHUNK_SIZE:
                    filename = _get_file_name(path.name, count)
                    ret_val.append(_create_rule_srv_wrapper(rule_set, filename, partial_rule.getvalue(
                    ), ignore_errors=ignore_errors, by_pass_validation=by_pass_validation, header=header))
                    partial_rule = StringIO()
                    count += 1
        if partial_rule.tell() > 0:
            filename = _get_file_name(path.name, count)
            ret_val.append(_create_rule_srv_wrapper(rule_set, filename, partial_rule.getvalue(
            ), ignore_errors=ignore_errors, by_pass_validation=by_pass_validation, header=header))
        return ret_val
    else:
        with path.open() as f:
            return [_create_rule_srv_wrapper(rule_set, path.name, f.read(), ignore_errors=ignore_errors)]


def create_ruleset_service(ruleset: Dict) -> InsertOneResult:
    ruleset['state'] = RULESET_STATES[0]
    ruleset["_id"] = uuid.uuid4().hex
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    ruleset['createdDate'] = dt_string
    ruleset['lastModifiedDate'] = dt_string
    ret_val = mongo_ruleset().insert_one(ruleset)
    return ret_val


def create_rule_service(rule: Dict, ruleset_id: str, projection={"rule": False}) -> Dict:
    rule["_id"] = uuid.uuid4().hex
    rule["rule_set_id"] = ruleset_id
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    rule['createdDate'] = dt_string
    rule['lastModifiedDate'] = dt_string
    ret_val = mongo_rule().insert_one(rule)
    return mongo_rule().find_one({'_id': ret_val.inserted_id}, projection=projection)


def process_zipfile(export_path: str, some_zip: str, rule_set: Dict, by_pass_validation: bool = False) -> List[Dict]:
    ret_val = []
    with ZipFile(some_zip) as f:
        f.extractall(export_path)
    for root, dirs, files in os.walk(export_path):
        for file_path in files:
            abs_path = root + "/" + file_path
            if does_file_have_ext(abs_path, '.txt') or does_file_have_ext(abs_path, '.rules'):
                rule_or_rules = create_rule_from_file(
                    Path(abs_path), rule_set, by_pass_validation=by_pass_validation)
                if isinstance(rule_or_rules, list):
                    ret_val += rule_or_rules
                else:
                    ret_val.append(rule_or_rules)
    return ret_val


def test_pcap_against_suricata_rule(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = '{}/suricata.rules'.format(rules_tmp_dir)
        with Path(filename).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/suricata:{}".format(
                SURICATA_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {rules_dir}:/etc/suricata/rules/ "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/var/log/suricata/ "
                   "localhost:5000/tfplenum/suricata:{version} "
                   "-c /etc/suricata/suricata.yaml --set stats.enabled=true -r /pcaps/{pcap_name} -l /var/log/suricata/")\
                .format(rules_dir=rules_tmp_dir,
                        pcap_dir=PCAP_UPLOAD_DIR,
                        results_dir=results_tmp_dir,
                        pcap_name=pcap_name,
                        version=SURICATA_IMAGE_VERSION)
            output, ret_val = run_command2(pull_docker_cmd)
            if ret_val == 0:
                output, ret_val = run_command2(cmd)
                if ret_val == 0:
                    results = Path(results_tmp_dir)
                    for results_path in results.glob("eve-*"):
                        return send_file(str(results_path))

    return {"error_message": output}, 400


def test_pcap_against_zeek_script(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = "custom.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
                ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{script_dir} "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/data/ "
                   "-w /data/ "
                   "--entrypoint /opt/zeek/bin/zeek "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{pcap_name} {script_dir}/{file_to_test}").format(tmp_dir=rules_tmp_dir,
                                                                               pcap_dir=PCAP_UPLOAD_DIR,
                                                                               version=ZEEK_IMAGE_VERSION,
                                                                               script_dir=ZEEK_SCRIPT_DIR,
                                                                               pcap_name=pcap_name,
                                                                               results_dir=results_tmp_dir,
                                                                               file_to_test=filename)
            stdoutput, ret_val = run_command2(pull_docker_cmd)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd)
                if stdoutput != '':
                    with Path(results_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return {"error_message": stdoutput}, 400


def test_pcap_against_zeek_intel(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as rules_tmp_dir:
        filename = "local.zeek"
        filepath = '{}/{}'.format(rules_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(
                "@load frameworks/intel/seen\nredef Intel::read_files += { \"/opt/tfplenum/zeek/intel.dat\" };")

        Intel_Name = "intel.dat"
        Intel_Path = '{}/{}'.format(rules_tmp_dir, Intel_Name)
        with Path(Intel_Path).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
                ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}/{file_to_test}:{script_dir}/{file_to_test} "
                   "-v {tmp_dir}/{Intel_File}:{script_dir}/{Intel_File} "
                   "-v {pcap_dir}/{Pcap_Name}:/pcaps/{Pcap_Name} "
                   "-v {results_dir}/:/data/ "
                   "-w /data/ "
                   "--entrypoint /opt/zeek/bin/zeek "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{Pcap_Name} "
                   "{script_dir}/{file_to_test}").\
                format(file_to_test=filename,
                       Intel_File=Intel_Name,
                       pcap_dir=PCAP_UPLOAD_DIR,
                       Pcap_Name=pcap_name,
                       results_dir=results_tmp_dir,
                       script_dir=ZEEK_INTEL_PATH,
                       tmp_dir=rules_tmp_dir,
                       version=ZEEK_IMAGE_VERSION)
            stdoutput, ret_val = run_command2(pull_docker_cmd)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd)
                if stdoutput != '':
                    with Path(rules_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return {"error_message": stdoutput}, 400


def test_pcap_against_zeek_signature(pcap_name: str, rule_content: str) -> Response:
    with tempfile.TemporaryDirectory() as sigs_tmp_dir:
        filename = "custom.sig"
        filepath = '{}/{}'.format(sigs_tmp_dir, filename)
        with Path(filepath).open('w') as fp:
            fp.write(rule_content)

        with tempfile.TemporaryDirectory() as results_tmp_dir:
            pull_docker_cmd = "docker pull localhost:5000/tfplenum/zeek:{}".format(
                ZEEK_IMAGE_VERSION)
            cmd = ("docker run --rm "
                   "-v {tmp_dir}:{sig_path} "
                   "-v {pcap_dir}:/pcaps/ "
                   "-v {results_dir}:/data/ "
                   "-w /data/ "
                   "--entrypoint /opt/zeek/bin/zeek "
                   "localhost:5000/tfplenum/zeek:{version} "
                   "-r /pcaps/{pcap_name} -s {sig_path}").format(tmp_dir=filepath,
                                                                 pcap_dir=PCAP_UPLOAD_DIR,
                                                                 version=ZEEK_IMAGE_VERSION,
                                                                 sig_path=ZEEK_SIG_PATH,
                                                                 pcap_name=pcap_name,
                                                                 results_dir=results_tmp_dir,
                                                                 file_to_test=filename)
            stdoutput, ret_val = run_command2(pull_docker_cmd)
            if ret_val == 0:
                stdoutput, ret_val = run_command2(cmd)
                if stdoutput != '':
                    with Path(results_tmp_dir + '/stdout.log').open('w') as output:
                        output.write(stdoutput)

                if ret_val == 0:
                    with tempfile.TemporaryDirectory() as output_dir:
                        results_tar_ball = output_dir + "/results"
                        zip_folder(results_tmp_dir, results_tar_ball)
                        return send_file(results_tar_ball + ".zip", mimetype="application/zip")

    return {"error_message": stdoutput}, 400


def _create_rule_srv_wrapper(rule_set: Dict,
                             rule_name: str,
                             rule_content: str,
                             is_enabled: bool = True,
                             ignore_errors: bool = False,
                             by_pass_validation: bool = False,
                             header: str = None):
    rule = {
        "ruleName": rule_name,
        "rule": rule_content,
        "isEnabled": is_enabled
    }

    rule_set_id = rule_set["_id"]
    rule_type = rule_set['appType']
    is_valid = False
    error_output = "Unsupported rule type."

    if check_zeek_exec_module(rule_type, rule_content):
        raise ProhibitedExecFunc("Exec module prohibited")

    if by_pass_validation:
        is_valid = True
    else:
        if rule_type == RULE_TYPES[0]:
            is_valid, error_output = validate_suricata_rule(rule)
        elif rule_type == RULE_TYPES[1]:
            is_valid, error_output = validate_zeek_script(rule)
        elif rule_type == RULE_TYPES[2]:
            if header:
                rule['rule'] = header + rule['rule']
            is_valid, error_output = validate_zeek_intel(rule)
        elif rule_type == RULE_TYPES[3]:
            is_valid, error_output = validate_zeek_signature(rule)

    if is_valid:
        return create_rule_service(rule, rule_set_id)

    if not ignore_errors:
        raise InvalidRuleSyntax(list(filter(None, error_output.split('\n'))))


def _get_file_name(filename: str, count: int) -> str:
    pos = filename.rfind('.')
    return "{}_{}{}".format(filename[0:pos], count, filename[pos:])


def check_zeek_exec_module(rule_type: str, rule: str):
    if rule_type == RULE_TYPES[1] and "Exec::" in rule:
        return True
    return False
