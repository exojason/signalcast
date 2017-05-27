const util = require('util');
const express = require('express');

global.__base = __dirname;

const config = require('./config');

const Messenger = require(__base + '/utils/messenger').Messenger;
const SignalManager = require(__base + '/utils/signal-manager').SignalManager;

const app = express();

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

const messenger = new Messenger(config);
const signalManager = new SignalManager(config, messenger);        
