const Nexmo = require('nexmo');

const NEXMO_API_KEY = 'b9cc018a';
const NEXMO_API_SECRET = 'a220e1b3a3e4e843';
const NEXMO_PHONE_NUMBER = '12034899933';

const nexmo = new Nexmo({
    apiKey: NEXMO_API_KEY,
    apiSecret: NEXMO_API_SECRET
});

class Messenger {
    constructor(config) {
        this.users = {};

        for(let i = 0; i < config.users.length; i++) {
            let user = config.users[i];
            this.users[user.username] = user;
        }
    }

    send(message, subscriber) {
        for(let i = 0; i > subscribers.length; i++) {
            let subscriber = subscribers[i];
            let user = this.users[subscriber]; 

            if (!this.isBlackoutPeriod(user)) {
                this.sendText(message, user);
            }
        }
    }

    isBlackoutPeriod(user) {
        let now = new Date();

        for(let i = 0; i < user.blackoutPeriods.length; i++) {
            let blackoutPeriod = user.blackoutPeriods[i];
            let blackoutStart = this.createDateTime(blackoutPeriod.start);
            let blackoutEnd = this.createDateTime(blackoutPeriod.end);     

            if (blackoutEnd.getHours() < blackoutStart.getHours()) {
                blackoutEnd.setDate(blackoutEnd.getDate() + 1);
            }

            if (blackoutStart < now && now < blackoutEnd) {
                return true;
            }
        }

        return false;
    }

    parseTime(timeStr) {

    }

    createDateTime(timeStr) {
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
        
        if (meridiem == 'pm') {
            hours += 12;
        }

        let dateTime = new Date();
        dateTime.setHours(hours, minutes, seconds);

        return dateTime;
    }

    sendText(message, user) {
        nexmo.message.sendSms(
            NEXMO_PHONE_NUMBER, user.phone, message,
            (err, responseData) => {
                if (err) {
                    console.log(err);
                } else {
                    console.dir(responseData);
                }
            }
        );    
    }
}

exports.Messenger = Messenger;