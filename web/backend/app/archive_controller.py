"""
Main module for handling all of the archive functionality accross the system.
"""
import json

from app import (app, logger, conn_mng)
from app.common import OK_RESPONSE, ERROR_RESPONSE
from bson import ObjectId
from shared.utils import encode_password, decode_password
from datetime import datetime
from flask import request, jsonify, Response
from pymongo.collection import Collection
from pymongo.results import InsertOneResult, DeleteResult
from shared.constants import KICKSTART_ID, KIT_ID, DATE_FORMAT_STR
from typing import Dict
from pprint import PrettyPrinter


def _get_mongo_collections(config_id: str):
    """
    Factory function call used for obtaining the appropriate database collections
    based on the passed in config_id.

    :param config_id: The config ID, all config ids are defined in the constants.py

    :return:
    """
    config_mongo_collection = None
    archive_mongo_collection = None

    if config_id == KICKSTART_ID:
        config_mongo_collection = conn_mng.mongo_kickstart
        archive_mongo_collection = conn_mng.mongo_kickstart_archive
    elif config_id == KIT_ID:
        config_mongo_collection = conn_mng.mongo_kit
        archive_mongo_collection = conn_mng.mongo_kit_archive
    else:
        raise ValueError("%s value is not supported" % config_id)

    return config_mongo_collection, archive_mongo_collection


def archive_form(page_form_payload: Dict,
                  is_completed_form: bool,
                  archive_mongo_collection: Collection,
                  comment="Archived by the system."):
    """
    Archives the form object.

    :param page_form_payload: The dictionary of the actual form object
    :param is_completed_form: A boolean that tells us if the form was in a completed state.
    :param archive_mongo_collection: The mongo collection that it will be saved to.
    :param comment: A user or system generated comment.
    """
    archive_form = {}
    archive_form['archive_date'] = datetime.utcnow().strftime(DATE_FORMAT_STR)
    archive_form['form'] = page_form_payload
    archive_form['is_completed_form'] = is_completed_form
    archive_form['comment'] = comment
    archive_mongo_collection.insert_one(archive_form)


@app.route('/api/delete_archive/<config_id>/<archive_id>', methods=['DELETE'])
def delete_archive(config_id: str, archive_id: str) -> Response:
    """
    Deletes the archive from the database.

    :param config_id: config ID we want to interact with.
    :param archive_id: The mongo ID of the document stored in the database.

    :return: An http response
    """
    _, archive_mongo_collection = _get_mongo_collections(config_id)
    result = archive_mongo_collection.delete_one({"_id": ObjectId(archive_id)}) # type: DeleteResult
    if result and result.deleted_count == 1:
        return str(result.deleted_count)
    else:
        logger.warning("Failed to delete archive ID %s" % archive_id)
    return ERROR_RESPONSE


def _is_completed_form(config_id: str, some_form: Dict, some_form2: Dict) -> bool:
    """
    Ensures that two forms are the same. It ignores password fields on the Kickstart
    form

    :param config_id: The config ID we want to interact with.
    :param some_form: A form dictionary
    :param some_form2: A form dictionary2

    :return: true if they match false otherwise.
    """
    form_cpy = some_form.copy()
    form_cpy2 = some_form2.copy()

    if config_id == KICKSTART_ID:
        del form_cpy['root_password']
        del form_cpy['re_password']
        del form_cpy2['root_password']
        del form_cpy2['re_password']

    return json.dumps(form_cpy, sort_keys=True) == json.dumps(form_cpy2, sort_keys=True)


@app.route('/api/archive_form', methods=['POST'])
def archive_form_api() -> Response:
    """
    Removes the kickstart inventory from the main collection and then
    archives it in a separate collection.

    :return:
    """
    payload = request.get_json()
    config_id = payload["config_id"]
    if config_id == KICKSTART_ID:
        payload["form"]["re_password"] = encode_password(payload["form"]["re_password"])
        payload["form"]["root_password"] = encode_password(payload["form"]["root_password"])

    config_mongo_collection, archive_mongo_collection = _get_mongo_collections(config_id)
    current_config = config_mongo_collection.find_one({"_id": config_id})
    is_completed_form = False
    if current_config is not None:
        is_completed_form = _is_completed_form(config_id, payload['form'], current_config['form'])

    archive_form(payload['form'], is_completed_form, archive_mongo_collection, payload['comment'])
    return OK_RESPONSE


@app.route('/api/restore_archived', methods=['POST'])
def restore_archived() -> Response:
    """
    Restores archived form from the archived collection.

    :return:
    """
    payload = request.get_json()
    config_id = payload["config_id"]
    config_mongo_collection, archive_mongo_collection = _get_mongo_collections(config_id)
    archived_form = archive_mongo_collection.find_one({"_id": ObjectId(payload["_id"])})
    if archived_form:
        if archived_form['is_completed_form']:
            config_mongo_collection.find_one_and_replace({"_id": config_id},
                                                         {"_id": config_id, "form": archived_form['form']},
                                                         upsert=True)  # type: InsertOneResult
        if config_id == KICKSTART_ID:
            archived_form['form']['root_password'] = decode_password(archived_form['form']['root_password'])
            archived_form['form']['re_password'] = decode_password(archived_form['form']['re_password'])
        archived_form['_id'] = str(archived_form['_id'])
        return jsonify(archived_form)
    return ERROR_RESPONSE


@app.route('/api/get_archived/<config_id>')
def get_archived_ids(config_id: str) -> Response:
    """
    Returns all the archived Kickstart Configuration form ids and their associated archive dates.
    :return:
    """
    _, archive_mongo_collection = _get_mongo_collections(config_id)
    ret_val = []
    result = archive_mongo_collection.find({})
    if result:
        for item in result:
            item["_id"] = str(item["_id"])
            ret_val.append(item)

    return jsonify(sorted(ret_val, key=lambda x: datetime.strptime(x['archive_date'], DATE_FORMAT_STR), reverse=True))
