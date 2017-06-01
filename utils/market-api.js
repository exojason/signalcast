var Poloniex = require('poloniex-api-node');

class MarketAPI {
    constructor() {
        this.poloniex = new Poloniex();

        this.requests = [];

        this.processNextRequest();         
    }

    requestTrades(symbol, start, end, callback) {
        this.requests.push({
            type: 'tradeHistory',
            symbol: symbol,
            start: start,
            end: end,
            callback: callback
        });
    }

    processNextRequest() {
        if (this.requests.length > 0) {
            var req = this.requests.shift();

            switch(req.type) {
                case 'tradeHistory':
                    this.poloniex.returnTradeHistory(req.symbol, req.start, req.end, req.callback);
                    break;
            }
        }

        setTimeout(() => {
            this.processNextRequest();
        }, 1000);        
    }        
}

exports.MarketAPI = MarketAPI;