var Signal = require('./signal').Signal;
var TradeQueue = require('./trade-queue').TradeQueue;

class PriceChangeSignal extends Signal {
    constructor(config, instrumentManager, messenger) {
        super(instrumentManager, messenger);
        
        this.symbol = config.symbol;
        this.period = this.parseTimespan(config.period);
        this.threshold = this.parsePercent(config.threshold);
        this.timeout = this.parseTimespan(config.timeout);
        this.subscribers = config.subscribers;
        
        this.validateConfiguration();

        this.instrument = this.instrumentManager.createInstrument(this.symbol);
        this.instrument.subscribe(this);
        
        this.tradeQueue = new TradeQueue(this.period);    
    }

    onTrades(instrument, trades) {    
        this.tradeQueue.addTrades(trades);
        
        this.calc();
    }

    calc() {
        if (this.tradeQueue.length < 2) { return; }
        
        let trade1 = this.tradeQueue.first;
        let trade2 = this.tradeQueue.last;
        
        let price1 = trade1.rate;
        let price2 = trade2.rate;
            
        let change = price1 - price2; 
        this.percentChange = change / price1;
        
        console.log('PriceChangeSignal (' + this.symbol + '): trades.length=' + this.tradeQueue.length);    
        console.log('price1=' + trade1.rate + ', timstamp=' + trade1.timestamp);
        console.log('price2=' + trade2.rate + ', timstamp=' + trade2.timestamp);
        
        let elapsed = (trade2.timestamp - trade1.timestamp) / 1000;;
        console.log('elapsed=' + elapsed);
        
        console.log('change=' + change);        
        console.log('percentChange=' + this.percentChange);        
        
        if (Math.abs(this.percentChange) >= this.threshhold) {
            this.notify();
        }
    }

    createMessage() {
        let message;
        
        let periodFormatted = parseFloat(this.period / 60.0).toFixed(0) + ' mins';
        
        if (this.priceChange > 0) {
            message = 'Price Surge (' + this.symbol + '): ' + 100 * this.percentChange + '%' + ' in ' + periodFormatted;        
        } else {
            message = 'Price Drop (' + this.symbol + '): ' + 100 * this.percentChange + '%' + ' in ' + periodFormatted;                 
        }
        
        return message;
    }
}

exports.PriceChangeSignal = PriceChangeSignal;