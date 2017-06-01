const util = require('util');
const fs = require("fs");
const http = require('http');
const express = require('express');
const mustache = require('mustache');

global.__base = __dirname;

var nodeEnv = process.env.NODE_ENV || 'development';

var config = require('./config/' + nodeEnv);
console.log(config);

const Messenger = require(__base + '/utils/messenger').Messenger;
const SignalManager = require(__base + '/utils/signal-manager').SignalManager;

const messenger = new Messenger(config);
const signalManager = new SignalManager(config, messenger);  

process.on('uncaughtException', function (error) {
   console.log(error.stack);
});

var app = express();

var server = http.createServer(app).listen(config.http.port); 

var cache = {
    templates: {}
};

app.get('/', function(req, res) {
    res.send('SignalCast is running'); 

    let signals = [];
    for(let i = 0; i < signalManager.signals.length; i++) {
        let signal = signalManager.signals[i];
        signals.push({
            type: signal.type
        });
    }

    sendResponse(req, res, 'signals.html', {
        signals: signals
    });
});

function printJSON(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function loadTemplates() {
    var templatesDir = './public/html';

    function readTemplate(filename) {
        fs.readFile(templatesDir + '/' + filename, 'utf8', function(err, template) {
            if (err) {
                console.log(err);
            } else {
                cache.templates[filename] = template;
            }
        });
    }

    fs.readdir(templatesDir, function(err, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            var filename = filenames[i];

            readTemplate(filename);
        }
    });

    setTimeout(loadTemplates, 3000);
}

function sendResponse(req, res, templateFilename, data) { 
    var html = renderHTML(templateFilename, data);
    res.send(body);
}

function renderHTML(filename, data) {
    var template = cache.templates[filename];
    return mustache.to_html(template, data ? data : {});
}

function redirect(res, url) {
    res.writeHead(301, {
        Location: url
    });
    res.end();
}

loadTemplates();