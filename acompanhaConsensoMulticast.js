// requires
// var app = require('express')();
var express = require('express');
var app = express();
//app sets
app.set('view engine', 'ejs'); //setting engine
//app uses
app.use(express.static('publico')); //com isso tudo o que eu colocar na pasta publico fica disponível de forma direta para ser inserido no codigo

//################# UDP Datagram ###############
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
var arrayProcessos = [];

//classes necessárias
const phaseKing = require('./class.consensoPhaseKing');
const metodosAux = require('./class.consensoMetodosAuxiliares');


//DECLARAR OS OBJETOS COMO GLOBAIS PARA:
//classe com os metodos para o phaseKing
var consensoPHK = new phaseKing();
//classe com métodos para tratamento de strings
var auxiliares = new metodosAux();

//erro
server.on('error', (err) => {
  console.log(`Erro ao tentar iniciar o rest :\n${err.stack}`);
  server.close();
});

//recebe solicitação de uso e ouve as mensagens
server.on('message', async (msg, rinfo) => {
  // transformando a mensagem em um objeto (para facilitar):
  var mensagem = `${msg}`;
  //converter a string Json para objeto Json - que será incluído no arrayProcessos 
  objMensagem = JSON.parse(mensagem);
  //incluindo dados do processo no arrayProcessos
  // arrayProcessos.push(`${msg}`);
  arrayProcessos.push(objMensagem);
  //debugger
  // console.log (arrayProcessos);
  console.log(`MSG RECEBIDA-> IP ${rinfo.address} : ${rinfo.port} -> Json=> ${mensagem}`);
  console.log (` * Qtd msgs trocadas no meio:  ${arrayProcessos.length} `);
  //quando todos os processos estiverem ok, vamos iniciar a verificação 
  // if (arrayProcessos.length == 5){
  //   console.log (`\n Todos os processos ativos. Verificando mensagens com Phase-King ...`);
    // //declarando um obj com o phaseKing e já informando o arrayProcessos (com as msgs + chavesPúblicas)
    
    // consensoPHK.setArrayProcessos(arrayProcessos);
    // consensoPHK.imprimeProcs(arrayProcessos);
  // }
  
});

//ouvindo a porta
server.on('listening', () => {
  const address = server.address();
  console.log(`--------------------------\n Processo de exibição de mensagens do canal - ouvindo na porta:  ${address.address}:${address.port} \n-----------------------`);
});

//cria um server (listen) na porta 41234
// server.bind(41234, 'localhost'); // Prints: server listening 0.0.0.0:41234
server.bind(41234, function() {
  //apenas como exemplo: o localhost já é incluído automaticamente como parte do multicast
  //mas se eu quiser incluir o ip de outro computador na rede local, basta fazer assim:
  server.addMembership('224.0.0.114');
  server.addMembership('224.0.0.100'); 
  //note que ao incluir um membro , vc está incluindo um computador ... pois as portas já são no nível do IP/UDP
  //Multicast 4.4.1 - Sist. Distribuídos - Coulouris
});

//STACKOVERFLOW PARA ESCUTAR EM MAIS DE UM SOCKET NO MESMO IP
//https://stackoverflow.com/questions/24496022/how-to-bind-socket-to-more-than-one-port-nodejs

