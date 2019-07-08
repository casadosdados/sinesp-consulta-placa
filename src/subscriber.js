const { register, listen } = require('push-receiver/src');
const request = require('request');
const Sinesp = require('./app/sinesp');

const appInfo = {
    senderId   : '905942954488',
    cert       : 'daf1d792d60867c52e39c238d9f178c42f35dd98',
    appPackage : 'br.gov.sinesp.cidadao.android',
};

let tokens = [];
let fcmToken = '';

const URL_GOOGLE_FCM = 'https://android.clients.google.com/c2dm/register3'
const USER_AGENT = 'Android-GCM/1.5 (victara MPES24.49-18-7)';
class Subscriber {
    constructor () {
    }

    static async newTokenGoogle() {
        try {
            const credentials = await register(appInfo);
            Subscriber.fcmToken = credentials.fcm.token;
            console.log('Use this following token to send a notification', Subscriber.fcmToken);
            // this.subscribe(credentials)
            return Subscriber.fcmToken;
        } catch (e) {
            console.log('erro na solicitação, tentando novamente', e)
            return Subscriber.newTokenGoogle()
        }
    }

    // subscribe (credentials) {
    //     const persistentIds = [] // get all previous persistentIds from somewhere (file, db, etc...)
    //     listen({ ...credentials, persistentIds}, () => {});
    // }

    static async requestNewToken() {
        let response = await Subscriber.newTokenGoogle()
        let s = new Sinesp('GGG6669');
        fcmToken = response;
        let res = await s.request(response);
        if (res.status === 'error' || res.codigoRetorno === '8') {
            return await Subscriber.requestNewToken();
        }
        if (tokens.length >= 50) {
            tokens.shift();
        }
        tokens.push(response)
        return response
    }

    static get getFcmToken() {
        return fcmToken;
    }

    static get getAllFcmToken() {
        return tokens;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    changeToken() {
        let index= Subscriber.getRandomInt(0, tokens.length - 1)
        fcmToken = tokens[index]
    }
}


(new Subscriber()).changeToken();

Subscriber.requestNewToken();
// solicita novo token a cada 24 horas
setInterval(() => {
    Subscriber.requestNewToken()
}, 1800 * 1000);

const sub = new Subscriber();

setInterval(() => {
    sub.changeToken();
}, 60 * 1000);

module.exports = Subscriber;