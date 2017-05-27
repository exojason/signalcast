const util = require('util');
const express = require('express');

global.__base = __dirname;

var nodeEnv = process.env.NODE_ENV || 'development';
console.log('nodeEnv=' + nodeEnv);

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

app.get('/', function(req, res) {
    res.send('SignalCast is running'); 
});