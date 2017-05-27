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

    get first() {
        return this.trades[0];
    }

    get last() {
        return this.trades.length > 0 ? this.trades[this.trades.length-1] : null;
    }

    addTrades(trades) {
        console.log('addTrades-1: trades.length=' + trades.length);
        console.log('addTrades-2: this.trades.length=' + this.trades.length);        
        console.log(trades);

        if (!this.trades.length) {
            let now = new Date();    

            console.log('addTrades-3a: now=' + now);
            console.log('addTrades-3b: this.period=' + this.period);

            for(let i = 0; i < trades.length; i++) {
                let trade = trades[i];        
                let elapsed = (now - trade.timestamp) / 1000;

                console.log('addTrades-3c: trade.timestamp=' + trade.timestamp);                
                console.log('addTrades-3d: elapsed=' + elapsed);

                if (elapsed <= this.period) {   
                    console.log('addTrades-3e:');                    

                    this.trades.push(trade);   
                }

                console.log('addTrades-3f: this.trades.length=' + this.trades.length);                      
            }

            console.log('addTrades-4:');            
        } else {

            console.log('addTrades-5:');

            this.trades.push.apply(this.trades, trades);

            console.log('addTrades-6: this.trades.length=' + this.trades.length);   

            this.removeOldTrades();                

            console.log('addTrades-7: this.trades.length=' + this.trades.length);               
        }
        
        this.calcStats();    
    }

    removeOldTrades() {
        // Find cut index
        let now = new Date();
        let removeCount = -1;

        console.log('removeOldTrades-1:');
        console.log('    now=' + now);
        console.log('    this.period=' + this.period);

        for(let i = 0; i < this.trades.length; i++) {
            let trade = this.trades[i];
            let elapsed = (now - trade.timestamp) / 1000;;
            
            console.log('    i=' + i + ', trade.timestamp=' + trade.timestamp + ', elapsed=' + elapsed + ', ');   

            if (elapsed < this.period) {
                removeCount = i; 
                break;                
            }
        }

        console.log('removeOldTrades-2: removeCount=' + removeCount);

        if (removeCount >= 0) {
            this.trades.splice(0, removeCount);   
        }

        console.log('removeOldTrades-3: this.trades.length=' + this.trades.length);           
    }

    calcStats() {
        console.log('calcStats-: trades:');
        console.log(this.trades);

        this.open = this.trades[0].rate;
        this.low = this.open;
        this.high = this.open;    
        this.close = this.trades[this.trades.length - 1].rate;
        this.volume = 0;
        this.buyVolume = 0;
        this.sellVolume = 0;
        
        for(let i = 0; i < this.trades.length; i++) {
            let trade = this.trades[i];

            if (trade.rate < this.low) {
                this.low = trade.rate;
            }
            if (trade.rate > this.high) {
                this.high = trade.rate;
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
