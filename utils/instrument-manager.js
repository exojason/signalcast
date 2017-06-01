var Instrument = require('./instrument').Instrument;
var MarketAPI = require('./market-api').MarketAPI;

class InstrumentManager {
    constructor() {
        this.instruments = {};

        this.marketAPI = new MarketAPI();
    }

    createInstrument(symbol) {
        let instrument;
        
        if (this.instruments[symbol]) {
            instrument = this.instruments[symbol];
        } else {     
            instrument = new Instrument(symbol, this.marketAPI);            
            this.instruments[symbol] = instrument;
        }
        
        return instrument;
    }
}

exports.InstrumentManager = InstrumentManager;