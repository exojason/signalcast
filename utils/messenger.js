const Nexmo = require('nexmo');

const NEXMO_API_KEY = 'b9cc018a';
const NEXMO_API_SECRET = 'a220e1b3a3e4e843';
const NEXMO_PHONE_NUMBER = '12034899933';

class Messenger {
    constructor(config) {
        this.timezoneOffset = (new Date()).getTimezoneOffset();

        this.nexmo = new Nexmo({
            apiKey: NEXMO_API_KEY,
            apiSecret: NEXMO_API_SECRET
        });

        this.users = {};

        for(let i = 0; i < config.users.length; i++) {
            let user = config.users[i];
            this.users[user.username] = user;
        }

        this.messageQueue = [];

        this.processNextMessage();      
    }

    send(text, priority, subscribers) {
        for(let i = 0; i < subscribers.length; i++) {
            let subscriber = subscribers[i];
            let user = this.users[subscriber]; 

            if (!this.isBlackoutPeriod(user) || priority == 'high') {
                console.log('SENDING MSG: "' + text + '" to ' + user.phone);

                this.messageQueue.push({
                    text: text,                    
                    phone: user.phone
                });                
            }
        }
    }

    isBlackoutPeriod(user) {
        for(let i = 0; i < user.blackoutPeriods.length; i++) {
            var currentTimeValue = this.getCurrentTimeValue();

            let blackoutPeriod = user.blackoutPeriods[i];

            let blackoutStart = this.createTimeValue(blackoutPeriod.start, user.timezoneOffset);
            let blackoutEnd = this.createTimeValue(blackoutPeriod.end, user.timezoneOffset);

            if (blackoutStart < currentTimeValue && currentTimeValue < blackoutEnd) {
                return true;
            }
        }

        return false;
    }

    getCurrentTimeValue() {
        let now = new Date();

        let hours = now.getHours();
        let minutes = now.getMinutes();

        let value = hours + (minutes / 60);

        return value;
    }

    createTimeValue(timeStr, timezoneOffset) {
        let meridiem;
        if (timeStr.length >= 3) {
            let str = timeStr.substr(timeStr.length - 2).toLowerCase();
            if (str == 'am' || str == 'pm') {
                meridiem = str;
                timeStr = timeStr.substr(0, timeStr.length - 2);                
            }
        }

        let parts = timeStr.split(":");
        let hours = parseInt(parts[0]);
        let minutes = parts.length >= 2 ? parseInt(parts[1]) : 0;
        let seconds = parts.length == 3 ? parseInt(parts[2]) : 0;
        
        // Account for 12-hour clock
        if (meridiem == 'am' && hours == 12) {
            hours = 0;
        }

        // Adjust for 12 hour clock
        if (meridiem == 'pm') {
            hours += 12;
        }

        let value = hours + (minutes / 60);
        value += (timezoneOffset - this.timezoneOffset) / 60;
        value %= 24;

        return value;
    }

    processNextMessage() {
        if (this.messageQueue.length > 0) {
            var message = this.messageQueue.shift();

            this.nexmo.message.sendSms(
                NEXMO_PHONE_NUMBER, message.phone, message.text,
                (err, responseData) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.dir(responseData);
                    }
                }
            );             
        }

        setTimeout(this.processNextMessage.bind(this), 1000);
    }
}

exports.Messenger = Messenger;