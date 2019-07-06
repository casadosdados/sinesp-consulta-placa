let Subscriber = require('./src/subscriber');
let Sinesp = require('./src/app/sinesp');
let express = require('express');
let cors = require('cors');

let s = new Subscriber();
// s.requestNewToken()

let app = express();
app.use(cors({
    credentials: true,
    origin: '*'
}));

app.get('/sinesp/token', function (req, res) {
    res.send({
        token: Subscriber.getFcmToken
    });
});

app.get('/sinesp/token/new', async (req, res) => {
    let token = await Subscriber.requestNewToken()
    res.send({
        token
    })
});


app.get('/sinesp/token/all', async (req, res) => {
    res.send({
        tokens: Subscriber.getAllFcmToken
    })
});

app.get('/sinesp/placa/:placa', async (req, res, next) => {
    let placa = req.params.placa;
    if (!Sinesp.isPlaca(placa)) {
        res.send({
            mensagem: 'Placa inválida'
        })
        return;
    }
    try {
        placa = placa.replace('-', '');
        let sinespAPi = new Sinesp(placa)
        response = await sinespAPi.request(Subscriber.getFcmToken)
        res.send(response)
    } catch (e) {
        console.log(e)
        res.send({
            status: 'error',
            message: e.toString()
        })
    }
});

app.listen(3000, function () {
    console.log('listening on port 3000');
});