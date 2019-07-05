const { createHmac } = require('crypto');
const Subscriber = require('./../subscriber');
const xml2js = require('xml2js');
const request = require('request');
const moment = require('moment');


const SECRET = '#8.1.0#0KnlVSWHxOih3zKXBWlo';
const URL_SINESP_API = 'https://cidadao.sinesp.gov.br/sinesp-cidadao/mobile/consultar-placa/v5';
const USER_AGENT = 'SinespCidadao / 3.0.2.1 CFNetwork / 758.2.8 Darwin / 15.0.0';
const parser = new xml2js.Parser({ attrkey: "ATTR" });

let tXml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:getStatusResponse xmlns:ns2="http://soap.ws.placa.service.sinesp.serpro.gov.br/"><return><codigoRetorno>0</codigoRetorno><mensagemRetorno>Sem erros.</mensagemRetorno><codigoSituacao>0</codigoSituacao><situacao>Sem restrição</situacao><modelo>FIAT/TEMPRA OURO 16V</modelo><marca>FIAT/TEMPRA OURO 16V</marca><cor>Cinza</cor><ano>1995</ano><anoModelo>1995</anoModelo><placa>GGG6669</placa><data>05/07/2019 às 11:14:08</data><uf>SP</uf><municipio>SAO PAULO</municipio><chassi>30578</chassi><dataAtualizacaoCaracteristicasVeiculo>08/06/2019</dataAtualizacaoCaracteristicasVeiculo><dataAtualizacaoRouboFurto>04/07/2019</dataAtualizacaoRouboFurto><dataAtualizacaoAlarme>04/07/2019</dataAtualizacaoAlarme></return></ns2:getStatusResponse></soap:Body></soap:Envelope>';

module.exports = class Sinesp {

    constructor (placa) {
        this.placa = placa
    }

    hash () {
        return createHmac('sha1', `${this.placa}${SECRET}`).update(this.placa).digest('hex')
    }

    body () {
        let hashSplited = Subscriber.getFcmToken.split(':')
        return `<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">
    <v:Header>
         <b>motorola XT1097</b>
        <c>ANDROID</c>
        <d>8.1.0</d>
        <e>4.7.4</e>
        <f>192.168.0.23</f>
        <g>${this.hash()}</g>
        <h>0.0</h>
        <i>0.0</i>
        <k />
        <l>${moment().format("Y-MM-DD HH:mm:ss")}</l>
        <m>8797e74f0d6eb7b1ff3dc114d4aa12d3</m>
        <n>${hashSplited[0]}</n>
    </v:Header>
    <v:Body>
        <n0:getStatus xmlns:n0="http://soap.ws.placa.service.sinesp.serpro.gov.br/">
            <a>${this.placa}</a>
        </n0:getStatus>
    </v:Body>
</v:Envelope>
        `
    }

    async request () {
        let req = {
            method: 'POST',
            body: this.body(),
            uri: URL_SINESP_API,
            headers: {
                'user-agent': USER_AGENT,
                'Authorization': `Token ${Subscriber.getFcmToken}`,
                'Content-type': 'application/xml;charset=utf-8'
            }
        };
        if (process.env.CDD_PROXY) {
            req['proxy'] = process.env.CDD_PROXY;
        }
        try {

            // let response = await axios.post(URL_SINESP_API, this.body(), options)
            // let response = {data: tXml};
            let response = await new Promise((resolve, reject) => {
                request(req, (error, response, body) => {
                    resolve(body);
                })
            })
            return await this.parseResponse(response)
        } catch (e) {
            return {status: 'error', message: e.toString()}
        }
    }

    async parseResponse(response) {
        let newXml = response.replace(/^.*?(<return>.*?<\/return>)<.*?Envelope>/, '$1');
        let r = await (new Promise((resolve, reject) => {
            parser.parseString(newXml, (error, result) => {
                if (error) {
                    return resolve({status: 'error', message: error.toString()})
                }
                if (result.return.codigoRetorno[0] != 0) {
                    return resolve({
                        codigoRetorno: result.return.codigoRetorno[0],
                        mensagemRetorno: result.return.mensagemRetorno[0],
                    })
                }
                resolve({
                    codigoRetorno: result.return.codigoRetorno[0],
                    mensagemRetorno: result.return.mensagemRetorno[0],
                    codigoSituacao: result.return.codigoSituacao[0],
                    situacao: result.return.situacao[0],
                    modelo: result.return.modelo[0],
                    cor: result.return.cor[0],
                    ano: result.return.ano[0],
                    anoModelo: result.return.anoModelo[0],
                    placa: result.return.placa[0],
                    data: result.return.data[0],
                    uf: result.return.uf[0],
                    municipio: result.return.municipio[0],
                    chassi: result.return.chassi[0],
                    dataAtualizacaoCaracteristicasVeiculo: result.return.dataAtualizacaoCaracteristicasVeiculo[0],
                    dataAtualizacaoRouboFurto: result.return.dataAtualizacaoRouboFurto[0],
                    dataAtualizacaoAlarme: result.return.dataAtualizacaoAlarme[0],

                })
            })
        })).then(r => r)
        return r
    }

    static isPlaca (placa) {
        return /^[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}$/.test(placa)
    }
}

