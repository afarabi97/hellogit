from app import app, conn_mng
from flask import jsonify, Response
import json
from bson import ObjectId
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder


@app.route('/api/tasks', methods=['GET'])
def get_tasks() -> Response:
    """
    Gets all tasks from mongodb

    """
    tasks = list(conn_mng.mongo_celery_tasks.find({}))
    return JSONEncoder().encode(tasks)


@app.route('/api/tasks', methods=['DELETE'])
def delete_all_tasks() -> Response:
    """
    Delete all tasks from mongodb

    """
    conn_mng.mongo_celery_tasks.delete_many({})
    return OK_RESPONSE
