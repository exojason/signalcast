var InstrumentManager = require('./instrument-manager').InstrumentManager;
var PriceChangeSignal = require('./price-change-signal').PriceChangeSignal;

class SignalManager {
    constructor(config, messenger) {
        this.messenger = messenger;
        this.instrumentManager = new InstrumentManager();
        this.signals = [];
        
        for(var i = 0; i < config.signals.length; i++) {        
            var signal = this.createSignal(config.signals[i]);
            if (signal && signal.enabled) {
                this.signals.push(signal);
            }
        } 
    }

    createSignal(config) {        
        switch(config.type) {
            case 'PriceChange':
                return new PriceChangeSignal(config, this.instrumentManager, this.messenger);                    
            default:
                return null;                    
        }    
    }
}

exports.SignalManager = SignalManager;