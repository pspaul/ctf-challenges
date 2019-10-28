#!/usr/bin/env python

import os
import re
import json
import requests
from flask import Flask, request


def submit_and_await_flag(url, port, flag, challenge_host, challenge_port, submit_api_auth_token='sie6Heep6aiJeiqu4oor'):
    """ Submits url to the """
    # submit to the bot
    headers = {
        'content-type': 'application/json',
    }
    data = json.dumps({
        'link': url,
        'token': submit_api_auth_token,
    })
    api_url = 'http://{}:{}//submit/api/visit'.format(challenge_host, challenge_port)
    
    print('Submitting {}'.format(url))
    print('        to {}'.format(api_url))
    r = requests.post(api_url, headers=headers, data=data)
    
    # check API response
    assert r.status_code == 200, 'submit api response status code is not 200: {} {}'.format(r.status_code, r.text)
    response = json.loads(r.text)
    assert ('success' in response) and (response['success'] == True), 'submit api response is not success: {}'.format(response)

    # await connect-back
    print('Awaiting flag...')
    app = Flask(__name__)
    @app.route('/', methods=['GET'])
    def receive_flag():
        if ('flag' in request.args) and (request.args['flag'] == flag):
            print('Flag received!')
            os._exit(0)
        return ''
    app.run(host='0.0.0.0', port=port)
