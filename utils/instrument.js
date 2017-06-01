var MarketAPI = require('./market-api').MarketAPI;

class Instrument {
    constructor(symbol) {    
        this.REQUEST_OVERLAP = 5; // seconds
        this.TRADE_HISTORY = 3600; // seconds
        
        this.symbol = symbol;
        
        this.subscribers = [];
        this.trades = [];
        this.lastRequest = null;
        
        this.marketAPI = new MarketAPI();

        this.requestTrades();
    }

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    fireOnTrades(trades) {
        for(let i = 0; i < this.subscribers.length; i++) {
            let subscriber = this.subscribers[i];        
            subscriber.onTrades(this, trades);
        }
    }

    getCurrentTimestamp() {
        return Math.floor(Date.now()/1000);  
    }

    requestTrades() {
        var currentTimestamp = this.getCurrentTimestamp();
        
        if (!this.lastRequest) {
            var start = currentTimestamp - this.TRADE_HISTORY;
            var end = currentTimestamp;
        } else {    
            var start = this.lastRequest - this.REQUEST_OVERLAP;
            var end = currentTimestamp
        }         

        this.lastRequest = currentTimestamp;    
        
        console.log('REQUEST: Start=' + new Date(start * 1000) + ', End=' + new Date(end * 1000));
        
        this.marketAPI.requestTrades(this.symbol, start, end, (err, trades) => {
            if (err){
                console.log(err);
            }       
            
            if (trades && trades.length) {        
                trades.reverse();
                this.fixTrades(trades);            
            
                console.log(this.symbol + ' => ' + trades.length +  ' new trades');            
            
                let newTrades = this.appendTrades(trades);
                
                this.fireOnTrades(newTrades);            
            }
        });
        
        setTimeout(() => {
            this.requestTrades();
        }, 30000);
    }

    fixTrades(trades) {
        var date = new Date();
        var timezoneOffsetMS = 1000 * 60 * date.getTimezoneOffset()

        for(let i = 0; i < trades.length; i++) {
            let trade = trades[i];

            trade.rate = parseFloat(trade.rate);
            trade.amount = parseFloat(trade.amount);
            trade.total = parseFloat(trade.total);

            trade.timestamp = new Date((new Date(trade.date)) * 1 - timezoneOffsetMS);            
            delete trade.date;        


        }    
    }

    appendTrades(trades) {
        let newTrades = [];
        let numDuplicates = 0;
        
        if (this.trades.length > 0) {        
            let lastTrade = this.trades[this.trades.length-1];         
            
            for(let i = 0; i < trades.length; i++) {            
                let trade = trades[i];
                                    
                if (trade.tradeID > lastTrade.tradeID) {
                    newTrades.push(trade);  
                    this.trades.push(trade);                 
                } else {
                    numDuplicates++;
                }
            }
        } else {
            newTrades = trades;
            this.trades = trades;
        }
        
        console.log(this.symbol + ' => ' + numDuplicates + ' duplicates');
        
        return newTrades;
    }
}

exports.Instrument = Instrument;