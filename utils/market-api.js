var Poloniex = require('poloniex-api-node');

class MarketAPI {
    constructor() {   
        this.REQUEST_OVERLAP = 5; // seconds
        this.TRADE_HISTORY = 3600; // seconds
        this.POLL_FREQUENCY_MS = 250; 

        this.poloniex = new Poloniex();

        this.markets = [];
        this.tradesRequestIndex = 0;

        this.subscribers = [];
    }

    init(callback) {
        this.poloniex.returnTicker((err, ticker) => {
            for(let symbol in ticker) {
                let market = ticker[symbol];
                
                if (symbol.substr(0, 3) == 'BTC') {
                    market.symbol = symbol;
                    market.lastTradesRequest = null;
                    market.requestCount = 0;
                    this.markets.push(market);
                }
            }

            callback();

            this.pollTrades();
        }); 
    }

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    pollTrades() {
        let market = this.markets[this.tradesRequestIndex];
        let currentTimestamp = this.getCurrentTimestamp();
        
        let start;

        if (!market.lastTradesRequest) {
            start = currentTimestamp - this.TRADE_HISTORY;
        } else {    
            start = market.lastTradesRequest - this.REQUEST_OVERLAP;
        }     

        let end = currentTimestamp;

        market.lastTradesRequest = end;
        market.requestCount++;

        this.poloniex.returnTradeHistory(market.symbol, start, end, (err, trades) => {
            if (!err) {
                console.log('TRADES: (' + market.symbol + '), count=' + market.requestCount + ', trades=' + trades.length);

                if (trades && trades.length) {
                    trades.reverse();
                    this.fixTrades(trades);  

                    for(var i = 0; i < this.subscribers.length; i++) {
                        let subscriber = this.subscribers[i];
                        subscriber.onTrades(market.symbol, trades);
                    }
                }              
            } else {
                console.log(err);
            }
        });

        this.tradesRequestIndex = ++this.tradesRequestIndex % this.markets.length;
        setTimeout(this.pollTrades.bind(this), this.POLL_FREQUENCY_MS);
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

    getCurrentTimestamp() {
        return Math.floor(Date.now()/1000);  
    }
}

exports.MarketAPI = MarketAPI;