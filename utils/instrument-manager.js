var Instrument = require('./instrument').Instrument;

class InstrumentManager {
    constructor() {
        this.instruments = {};
    }

    createInstrument(symbol) {
        let instrument;
        
        if (this.instruments[symbol]) {
            instrument = this.instruments[symbol];
        } else {     
            instrument = new Instrument(symbol);            
            this.instruments[symbol] = instrument;
        }
        
        return instrument;
    }
}

exports.InstrumentManager = InstrumentManager;