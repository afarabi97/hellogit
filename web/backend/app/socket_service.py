from app import socketio, conn_mng, logger


def log_to_console(job_name: str, jobid: str, text: str, color: str=None) -> None:
    """
    Callback function that logs to console.

    :param job_name: The name of the job
    :param jobid: The jobid
    :param text: The console output string
    :return:
    """

    log = {'jobName': job_name, 'jobid': jobid, 'log': text}
    if text.startswith('fatal'):
        log['color'] = 'red'
    elif text.startswith('skipping'):
        log['color'] = 'lightgreen'
    elif text.startswith('ok'):
        log['color'] = 'lightgreen'
    elif text.startswith('changed'):
        log['color'] = 'orange'
    else:
        log['color'] = 'white'

    if color:
        log['color'] = color
    
    socketio.emit('message', log, broadcast=True)
    #socketio.emit(jobid, log, broadcast=True, namespace='/console')
    conn_mng.mongo_console.insert_one(log)

