
const PriceChangeSignal = require('./price-change-signal').PriceChangeSignal;

class SignalManager {
    constructor(config, instrumentManager, messenger) {
        this.config = config;
        this.instrumentManager = instrumentManager;
        this.messenger = messenger;
        this.signals = [];
    }

    init() {
        for(let i = 0; i < this.config.signals.length; i++) {      
            var signalConfig = this.config.signals[i];
            switch(signalConfig.type) {
                case 'PriceChange':
                    if (Array.isArray(signalConfig.symbol)) {
                        let symbols = signalConfig.symbol;
                        for(let i = 0; i < symbols.length; i++) {
                            let symbolConfig = this.cloneConfig(signalConfig);
                            symbolConfig.symbol = symbols[i]; 
                            let signal = this.createSignal(symbolConfig);
                            this.signals.push(signal);
                        }
                    } else if (signalConfig.symbol == "*")  {
                        let symbols = Object.keys(this.instrumentManager.instruments);
                        for(let i = 0; i < symbols.length; i++) {
                            let symbolConfig = this.cloneConfig(signalConfig);
                            symbolConfig.symbol = symbols[i]; 
                            let signal = this.createSignal(symbolConfig);
                            this.signals.push(signal);
                        }
                    } else {
                        let signal = this.createSignal(signalConfig);
                        this.signals.push(signal);
                    }
                    break;                    
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

    cloneConfig(config) {
        return JSON.parse(JSON.stringify(config));        
    }
}

exports.SignalManager = SignalManager;