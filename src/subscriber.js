const { register, listen } = require('push-receiver/src');
const request = require('request');

const senderId = '905942954488';

const URL_GOOGLE_FCM = 'https://android.clients.google.com/c2dm/register3'
const USER_AGENT = 'Android-GCM/1.5 (victara MPES24.49-18-7)';
class Subscriber {
    constructor () {
    }

    // async requestNewToken () {
    //     try {
    //         const credentials = await register(senderId);
    //         Subscriber.fcmToken = credentials.fcm.token;
    //         console.log('Use this following token to send a notification', Subscriber.fcmToken);
    //         this.subscribe(credentials)
    //         return Subscriber.fcmToken;
    //     } catch (e) {
    //         console.log('erro na solicitação, tentando novamente', e)
    //         this.requestNewToken()
    //     }
    // }
    //
    // subscribe (credentials) {
    //     const persistentIds = [] // get all previous persistentIds from somewhere (file, db, etc...)
    //     listen({ ...credentials, persistentIds}, () => {});
    // }

    static randomString(length) {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static async requestNewToken() {
        let hashRandom = Subscriber.randomString(11);
        let body = `X-subtype=905942954488&sender=905942954488&X-app_ver=49&X-osv=23&X-cliv=fiid-12451000&X-gmsv=17785018&X-appid=${hashRandom}&X-scope=*&X-gmp_app_id=1%3A905942954488%3Aandroid%3Ad9d949bd7721de40&X-app_ver_name=4.7.4&app=br.gov.sinesp.cidadao.android&device=3580873862227064803&app_ver=49&info=szkyZ1yvKxIbENW7sZq6nvlyrqNTeRY&gcm_ver=17785018&plat=0&cert=daf1d792d60867c52e39c238d9f178c42f35dd98&target_ver=26`;
        let req = {
            method: 'POST',
            body,
            uri: URL_GOOGLE_FCM,
            headers: {
                'user-agent': USER_AGENT,
                'Authorization': `AidLogin 3580873862227064803:6185646517745801705`,
                'app': 'br.gov.sinesp.cidadao.android',
                gcm_ver: '17785018',
                'Content-type': 'application/x-www-form-urlencoded'
            }
        };

        let response = await new Promise((resolve, reject) => {
            request(req, (error, response, body) => {
                resolve(body);
            })
        })
        response = response.replace('token=', '');
        Subscriber.fcmToken = response;
        if (Subscriber.tokens.length >= 50) {
            Subscriber.tokens.pop()
        }
        Subscriber.tokens.push(response)
        return response
    }

    static get getFcmToken() {
        return Subscriber.fcmToken;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    changeToken() {
        let index= Subscriber.getRandomInt(0, Subscriber.tokens.length)
        Subscriber.fcmToken = Subscriber.tokens[index]
    }
}

Subscriber.fcmToken = '';
Subscriber.tokens = [];

(new Subscriber()).changeToken();

Subscriber.requestNewToken();
// solicita novo token a cada 24 horas
setInterval(() => {
    Subscriber.requestNewToken()
}, 86400 * 1000);

module.exports = Subscriber;