var Signal = require('./signal').Signal;
var TradeQueue = require('./trade-queue').TradeQueue;

class PriceChangeSignal extends Signal {
    constructor(config, instrumentManager, messenger) {
        super(config, instrumentManager, messenger);
        
        this.symbol = config.symbol;
        this.period = this.parseTimespan(config.period);
        this.threshold = this.parsePercent(config.threshold);
        this.direction = this.parseDirection(config.threshold);
        
        this.validateConfiguration();

        this.instrument = this.instrumentManager.createInstrument(this.symbol);
        this.instrument.subscribe(this);
        
        this.tradeQueue = new TradeQueue(this.period);    
    }

    onTrades(instrument, trades) {    
        this.tradeQueue.addTrades(trades);
        
        this.update();
    }

    update() {
        if (this.tradeQueue.length < 2) { return; }

        console.log('PriceChangeSignal (' + this.symbol + '): trades.length=' + this.tradeQueue.length);    

        let openingTrade = this.tradeQueue.open;
        let highTrade = this.tradeQueue.high;
        let lowTrade = this.tradeQueue.low;                
        let closingTrade = this.tradeQueue.close;
        let elapsed = (closingTrade.timestamp - openingTrade.timestamp) / 1000;;        

        console.log('open=' + openingTrade.rate + ', timstamp=' + openingTrade.timestamp);
        console.log('high=' + highTrade.rate + ', timstamp=' + highTrade.timestamp);
        console.log('low=' + lowTrade.rate + ', timstamp=' + lowTrade.timestamp);        
        console.log('close=' + closingTrade.rate + ', timstamp=' + closingTrade.timestamp);        
        console.log('elapsed=' + elapsed);

        let message;

        var upsidePercentChange = (closingTrade.rate - lowTrade.rate) / lowTrade.rate;
        var downsidePercentChange = (closingTrade.rate - highTrade.rate) / highTrade.rate; 

        console.log('upsidePercentChange=' + upsidePercentChange);     
        console.log('downsidePercentChange=' + downsidePercentChange);   
        console.log('direction=' + this.direction);           
        console.log('threshold=' + this.threshold);                 

        if ((this.direction == '+' && upsidePercentChange >= this.threshold) ||
            (!this.direction && upsidePercentChange >= this.threshold)) {
        
            let periodFormatted = parseFloat(this.period / 60.0).toFixed(0) + ' mins';
            let priceChangeFormatted = (Math.abs(100 * upsidePercentChange)).toFixed(1) + '%';
            let message = 'Price Surge (' + this.symbol + '): ' + 
                          priceChangeFormatted + ' in ' + periodFormatted + ', ' +
                          lowTrade.rate.toFixed(8) + ' => ' + closingTrade.rate.toFixed(8);  

            this.notify(message);

        } else if ((this.direction == '-' && downsidePercentChange <= this.threshold) ||
                   (!this.direction && downsidePercentChange <= -this.threshold)) {

            let periodFormatted = parseFloat(this.period / 60.0).toFixed(0) + ' mins';
            let priceChangeFormatted = (Math.abs(100 * downsidePercentChange)).toFixed(1) + '%';
            let message = 'Price Drop (' + this.symbol + '): ' + 
                          priceChangeFormatted + ' in ' + periodFormatted + ', ' +
                          highTrade.rate.toFixed(8) + ' => ' + closingTrade.rate.toFixed(8);  

            this.notify(message);
        }
    }
}

exports.PriceChangeSignal = PriceChangeSignal;