"""
Module that has commonly shared things between controller modules.
You can put constants or shared functions in this module.
"""
from flask import Response
from typing import List
import json

OK_RESPONSE = Response()
OK_RESPONSE.status_code = 200

NOTFOUND_RESPONSE = Response()
NOTFOUND_RESPONSE.status_code = 404

ERROR_RESPONSE = Response()
ERROR_RESPONSE.status_code = 500

def cursorToJson(csr, fields: List[str] = None, sort_field: str = None) -> List:
    """
    Take a cursor returned from a MongoDB search and convert
    it to list of records
    :param csr: Cursor returned from a MongoDB search (or any iterable 
    container)
    :param fields: List of field names to include in the response.
    :param sort_field: Optional field name to sort return records by
    :return: List of records containing the data of the records in the cursor.
    """
    records = []
    for record in csr: 
        new_record = {}
        if fields:
            for field in fields:
                new_record[field] = record[field]
        else:
            new_record = record
        new_record['_id'] = str(record['_id'])
        records.append(new_record)
    if sort_field:
        records.sort(key = lambda r : r[sort_field].upper())
    return records

def cursorToJsonResponse(csr, fields: List[str] = None, sort_field: str = None) -> Response:
    """
    Take a cursor returned from a MongoDB search and convert
    it to an API response containing the data.
    :param csr: Cursor returned from a MongoDB search (or any iterable 
    container)
    :param fields: List of field names to include in the response.
    :param sort_filed: Optional field name to sort return records by
    :return: flask.Response containing the data of the records in the cursor.
    """
    records = cursorToJson(csr, fields, sort_field) 
    return Response(json.dumps(records), mimetype='application/json')