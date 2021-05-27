"""
Controller responsible for handling the scrolling
console box when we kick off jobs.
"""
from app import app, socketio, conn_mng
from app.common import OK_RESPONSE
from flask import request, jsonify, Response
from app.middleware import controller_admin_required


@socketio.on('connect')
def connect():
    print('Client connected')


@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')


@app.route('/api/get_console_logs/<job_id>', methods=['GET'])
def get_console_logs(job_id: str) -> Response:
    """
    Gets the console logs by Job name.

    :param job_name: The name of the job (EX: Kickstart or Kit)
    """
    job_list =  {"jobid": job_id}
    logs = list(conn_mng.mongo_console.find(job_list, {'_id': False}))
    return jsonify(logs)


@app.route('/api/remove_console_output', methods=['POST'])
@controller_admin_required
def remove_console_logs() -> Response:
    """
    Removes console logs based on teh jobName.

    :return: OK Response.
    """
    payload = request.get_json()
    query = {'jobName': payload['jobName']}
    conn_mng.mongo_console.delete_many(query)
    return OK_RESPONSE
