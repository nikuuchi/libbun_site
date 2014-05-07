#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import time
import commands
import codecs
import json
import platform
import tempfile

from bottle import Bottle, run, request, static_file, BaseRequest

def createResponseJson(source, result, error):
    return json.dumps({'source': source, 'result': result, 'error': error})

def createSourceFile(name, contents):
    f = codecs.open(name, 'w', 'utf-8')
    f.write(contents)
    f.close()

def compileCommand(name, target):
    return commands.getoutput('java -jar {0}/../libbun-0.1.jar -t {1} -o {2} {3}'.format(rootPath, target, name[:-4], name))

def readCompiledFile(name):
    if os.path.exists(name):
        a = open(name, 'r')
        return a.read()
    return ''

#Server settings
BaseRequest.MEMFILE_MAX = 1024 * 1024 * 10 #TODO measure
app = Bottle()
rootPath = os.path.abspath(os.path.dirname(__file__))

#Server routings
@app.get('/')
def indexfile():
    return static_file('index.html', root=rootPath)

@app.get('/editor.html')
def indexfile():
    return static_file('editor.html', root=rootPath)

@app.post('/compile')
def compile():
    if not hasattr(request, 'json'):
        return 'error'
    if not ('source' in request.json and 'target' in request.json):
        return 'error'

    file = tempfile.NamedTemporaryFile(mode='w', suffix='.bun', prefix='tmp', dir='/tmp')
    name = file.name
    file.close() #tempfile cannot use utf-8 in python 2.7, so need to reopen

    createSourceFile(name, request.json["source"])
    error_message = compileCommand(name, request.json["target"])

    readFileName = name[:-4] + "." + request.json["ext"]
    message = readCompiledFile(readFileName)
    print readFileName
    print message

    return createResponseJson(message, '', error_message)

@app.post('/share')
def share():
    if not hasattr(request, 'json'):
        return 'error'
    if not 'source' in request.json:
        return 'error'

    file = tempfile.NamedTemporaryFile(mode='w', suffix='.bun', prefix='hwq', dir='./files')
    name = file.name
    file.close() #tempfile cannot use utf-8 in python 2.7, so need to reopen

    dirs = name.split('/')
    createSourceFile(name, request.json["source"])

    return json.dumps({'url': dirs[-1][3:-4]}) #FIXME validation

@app.route('/p/<filename>')
def getShareCode(filename):
    return static_file("hwq{0}.bun".format(filename), root=rootPath + '/files') #FIXME get file

@app.route('/samples/<filename>')
def server_static(filename):
    return static_file(filename, root=rootPath + '/../sample')

@app.route('/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root=rootPath)

run(app, host='0.0.0.0', port=3000)
