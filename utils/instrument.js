class Instrument {
    constructor(market) {            
        this.processMarket(market); 
        
        this.subscribers = [];
        this.trades = [];
    }

    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    processMarket(market) {
        for(let property in market) {
            this[property] = market[property];
        }
    }

    processTrades(trades) {
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
        
        if (newTrades.length > 0) {
            this.fireOnTrades(newTrades);
        }
    }

    fireOnTrades(trades) {
        for(let i = 0; i < this.subscribers.length; i++) {
            let subscriber = this.subscribers[i];        
            subscriber.onTrades(this, trades);
        }
    }    
}

exports.Instrument = Instrument;