## Consulta de Placa veicular
Este projeto fornece uma api que consulta placas veiculares no SINESP.

## Executando com docker
```bash
docker run --name sinesp-consulta-placa -p 3000:3000 -d casadosdados/sinesp-consulta-placa
```

## Instalação  e execução
- Requisitos para executar
* node >= 10
* npm
* git
 
```bash
git clone https://github.com/casadosdados/sinesp-consulta-placa.git
cd sinesp-consulta-placa
npm i
node index.js
```

### usando proxy
- com docker: -e CDD_PROXY=http:localhost:8888
- sem docker: ```CDD_PROXY=http:localhost:8888 node index.js```


### Rotas disponiveis

consulta a placa direto no sinesp
- GET /sinesp/placa/GGG6669

tokens para requisição no serviço
- GET /sinesp/token

solicita novo token
- GET /sinesp/token/new

todos tokens, limitado a 50
- GET /sinesp/token/all
