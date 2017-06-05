class Signal {
    constructor(config, instrumentManager, messenger) {
        this.type = config.type;
        this.subscribers = config.subscribers;       
        this.timeout = this.parseTimespan(config.timeout);   
        this.priority = config.priority;      
        this.instrumentManager = instrumentManager;
        this.messenger = messenger;

        this.lastNotification = null;    
    }

    validateConfiguration() {
        // TODO
    }

    parsePercent(str) {
        if (str.length > 1 && str.substr(str.length - 1) == '%') {
            let value = parseFloat(str.substr(0, str.length - 1)); 

            return (value == NaN) ? null : value / 100.0;
        } else {
            let value = parseFloat(str);
            
            return (value == NaN) ? null : value;
        }
    }

    parseDirection(str) {
        if (str.length > 0 && str.substr(0, 1) == '+') {
            return '+';
        } else if (str.length > 0 && str.substr(0, 1) == '-') {
            return '-';
        } else {
            return null;
        }
    }

    parseTimespan(str) {
        if (str.length > 3 ) {
            let units = str.substr(str.length - 3).toLowerCase();

            if (units == 'min') {
                let minutesStr = str.substr(0, str.length - 3);
                let minutes = parseInt(minutesStr);
                
                return (minutes == NaN) ? null : 60 * minutes;
            } else if (units == 'sec') {
                let secondsStr = str.substr(0, str.length - 3);
                let seconds = parseInt(secondsStr);
                
                return (seconds == NaN) ? null : seconds;
            } 
        }

        return null;
    }

    notify(message) {        
        var now = new Date();
        var elapsed = this.lastNotification ? Math.ceil((now - this.lastNotification) / 1000) : 0;

        console.log('elapsed=' + elapsed);
        console.log('this.timeout=' + this.timeout);
        console.log('this.lastNotification=' + this.lastNotification);

        if (!this.lastNotification || elapsed > this.timeout) {
            this.messenger.send(message, this.priority, this.subscribers); 

            this.lastNotification = now;       
        }  
    }    
}

exports.Signal = Signal;