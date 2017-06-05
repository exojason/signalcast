var Instrument = require('./instrument').Instrument;
var MarketAPI = require('./market-api').MarketAPI;

class InstrumentManager {
    constructor() {
        this.instruments = {};
        this.marketAPI = new MarketAPI();   
        this.marketAPI.subscribe(this);     
    }

    init(callback) {
        this.marketAPI = new MarketAPI();   
        this.marketAPI.subscribe(this);   

        this.marketAPI.init(() => {
            for(let i = 0; i < this.marketAPI.markets.length; i++) {
                let market = this.marketAPI.markets[i];
                let instrument = new Instrument(market, this.marketAPI);            
                this.instruments[market.symbol] = instrument;
            }
            callback();
        });       
    }

    getInstrument(symbol) {        
        return this.instruments[symbol];
    }

    onTrades(symbol, trades) {
        let instrument = this.getInstrument(symbol);
        instrument.processTrades(trades);
    }
}

exports.InstrumentManager = InstrumentManager;