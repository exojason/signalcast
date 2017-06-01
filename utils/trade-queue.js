class TradeQueue {
    constructor(period) {
        this.period = period;
        this.trades = [];    
        
        this.open;
        this.low;
        this.high;    
        this.close;
        this.volume;
        this.buyVolume;
        this.sellVolume;
        this.netVolume;
    }

    get length() {
        return this.trades.length;
    }

    getTrade(index) {
        return this.trades[index];
    }

    addTrades(trades) {
        if (!this.trades.length) {
            let now = new Date();    

            for(let i = 0; i < trades.length; i++) {
                let trade = trades[i];        
                let elapsed = (now - trade.timestamp) / 1000;

                if (elapsed <= this.period) {   
                    this.trades.push(trade);   
                }                     
            }            
        } else {
            this.trades.push.apply(this.trades, trades);

            this.removeOldTrades();                         
        }
        
        this.calcStats();    
    }

    removeOldTrades() {
        let now = new Date();
        let removeCount = -1;

        for(let i = 0; i < this.trades.length; i++) {
            let trade = this.trades[i];
            let elapsed = (now - trade.timestamp) / 1000;; 

            if (elapsed < this.period) {
                removeCount = i; 
                break;                
            }
        }

        if (removeCount >= 0) {
            this.trades.splice(0, removeCount);   
        }        
    }

    calcStats() {
        this.open = this.trades[0];
        this.low = this.open;
        this.high = this.open;    
        this.close = this.trades[this.trades.length - 1];
        this.volume = 0;
        this.buyVolume = 0;
        this.sellVolume = 0;
        
        for(let i = 0; i < this.trades.length; i++) {
            let trade = this.trades[i];

            if (trade.rate < this.low.rate) {
                this.low = trade;
            }
            if (trade.rate > this.high.rate) {
                this.high = trade;
            }
            
            this.volume += trade.amount;
            
            if (trade.type == 'buy') {
                this.buyVolume += trade.amount;
            } else {
                this.sellVolume += trade.amount;
            }
            
            this.netVolume = this.buyVolume - this.sellVolume;
        }   
    } 
}

exports.TradeQueue = TradeQueue;
