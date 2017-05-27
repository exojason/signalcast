

class Signal {
    constructor(instrumentManager, messenger) {
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

    notify() {
        if (!this.lastNotification || (new Date() - this.lastNotification) > this.timeout) {
            let message = this.createMessage();
            this.messenger.broadcast(message); 

            this.lastNotification = new Date();       
        }  
    }    
}

exports.Signal = Signal;