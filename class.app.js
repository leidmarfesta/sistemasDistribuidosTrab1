//#######bibliotecas necessarias#####
//udpDatagram - declarando como global
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4'); //vou usar o createSocket com a biblioteca udp4

//arquivos das minhas classes
var phaseKing = require('./class.consensoPhaseKing');

//DECLARAR OS OBJETOS COMO GLOBAIS PARA:
//classe com os metodos para o phaseKing
var consensoPHK = new phaseKing();
//variáveis globais
var tieBreakerProc1 = false;
var tieBreakerProc2 = false;

//exportando a classe
module.exports = class classApp1{
    //construtor da classe
    constructor(portaListen, nrProc, msg) {
        this._porta = portaListen;
        this._arrayPortas = [3059,3060,3061,3062,3063, 41234]; //contém todas as portas dos processos do multicast
        this._arrayProcessos = [];
        this._privKey = nrProc * 11; //somente estou definindo uma privKey simples (11, 22, 33 , 44 e 55)
        this._pubKey = nrProc * 11; //pubKey mesma lógica (11,22,33,44 e 55)
        this._objJsonEnviar = { nrProc: nrProc, publicKey: this._pubKey, mensagem: this.encodeMsg(msg,this._privKey) , msgFromPhaseKing:false, mult: 0};
        this._arrayProcessos.push(this._objJsonEnviar);
        //vai guardar o valor final escolhido pelo processo (1 ou 0) ... mas caso seja um processo defeituoso ele não precisa entrar em acordo com os outros e o valor final será 100
        this._mensagemValorFinal = 100; 
    }

    getArrayProcessos(){
        return this._arrayProcessos;
    }


    //encode - bem simples: msg + privKey +
    encodeMsg(msg, privKey){
        return msg + privKey;
    }

    //decode - bem simples: msg - pubKey
    decodeMsg(msg, pubKey){
        return msg - pubKey;
    }


    //print dos atributos publicos
    printPublicVarMsg(){
        // incluir este objeto no arrayProcessos
        console.log('* (class.app.js) variáveis inicializadas:  \n >>>>> arrayProcessos->', this._arrayProcessos)
        console.log(' >>>>> objJsonEnviar->', this._objJsonEnviar);
        console.log(' >>>>> arrayPortas->', this._arrayPortas , '\n');
    }

    //incluindo mensagem nova no array de processos (garantir também que já está decodificada!)
    addMsgsArrayProcessos (novoItem){
        //somente pode dar um push se a msg já estiver  DECODIFICADA (ou seja , valor menor que 11!)
        if (novoItem.mensagem >= 11){
            novoItem.mensagem = this.decodeMsg(novoItem.mensagem, novoItem.publicKey);
        }
        this._arrayProcessos.push(novoItem);
    }

    //inicializar listen processo 
    async startListen (){
        var portasProc = [this._porta]; //este array define em quais portas este processo vai escutar
        let selfNrProc = this._objJsonEnviar.nrProc;
        //iniciando o listen na(s) porta(s) especificadas

        portasProc.forEach(port => {      //começa o LISTEN em cada uma das portas do array portasProc
            udpServer.bind(port,'127.0.0.1')      //o bind indica que no localhost (127.0.0.1) na porta XXXX para listen
            //callback do udpServer.on - ativa o  listening  
            //o listening se refere ao buffer e, sempre que chegar uma msg, ele vai parar e executar o callback
            udpServer.on('listening', function() {
                var address = udpServer.address()
                console.log(`\n * (class.app.js)  Proc ${selfNrProc} : REST na porta->  ${address.address}  :   ${address.port}`)
            });

            //habilitando também o recebimento de mensagens ...
            udpServer.on('message', async (msg, rinfo) => {
                console.log(" ===> (class.app.js) Mensagem recebida: "+ msg +" IP "+rinfo.address+ " : "+ rinfo.port )
                //convertendo a mensagem para objeto Json:
                var arrayMsgsRecebidas = JSON.parse(msg);

                //decodificando as mensagens recebidas
                //Neste contexto é realizada a verificação de "assinatura digital", pois junto com a mensagem é enviada a public key e desta forma o receptor consegue 
                //conferir quem foi o remetente
                for (msg of arrayMsgsRecebidas){
                    //somente vou fazer decode se a msg >=  11 (que , na logica implementada, é o valor mínimo que uma msg encoded vai ter!!)
                    if (msg.mensagem >= 11 ){
                        msg.mensagem = this.decodeMsg(msg.mensagem, msg.publicKey);
                        //confirmando assinatura digital
                        if (msg.publicKey == msg.nrProc * 11 && (msg.mensagem == 1 || msg.mensagem == 0 )){
                            console.log(` \n *** (class.app.js) - pubKey (${msg.publicKey})+ nrProc (${msg.nrProc}): OK --> ASSINATURA CONFIRMADA`);
                        }else{
                            console.log(` \n --- (class.app.js) - pubKey (${msg.publicKey})+ nrProc (${msg.nrProc}): NÃO --> PROCESSO DEFEITUOSO`);
                        }
                    }
                    console.log('  *** (class.app.js) - msg DECODED -->', msg );
                }

                var majority = new Object();
                //verificando se a minha mensagem já está no array de objetos recebido
                var minhaMsgOK = false;
                var selfObjJsonEnviar = this._objJsonEnviar; //No loop "for..of" abaixo ele altera o contexto do "this." . Por isso criamos uma nova var
                var selfArrayProcessos = this._arrayProcessos;
                
                //PRIMEIRA VERIFICAÇÃO: SE A MENSAGEM RECEBIDA É TIE-BREAKER (DO PHASE KING)
                if (arrayMsgsRecebidas[0].msgFromPhaseKing){
                    console.log(`-------------------------------`);
                    console.log(`* (class.app.js) TIE-BREAKER RECEBIDO -> NrProc KING[${arrayMsgsRecebidas[0].nrProc}], PubKey [${arrayMsgsRecebidas[0].publicKey}], Mensagem [${arrayMsgsRecebidas[0].mensagem}], FromPHK [${arrayMsgsRecebidas[0].msgFromPhaseKing}], Mult [${arrayMsgsRecebidas[0].mult}]`);
                    console.log(`* (class.app.js) Nr deste processo -> ${selfNrProc}`);
                    //se é uma msg do PhaseKing, significa que temos uma msg com TIE-BREAKER aqui
                    //neste caso vamos verificar se o valor da msg que este processo escolheu é IGUAL ...
                    //se o valor for DIFERENTE ... vamos ter que fazer o ACORDO, ou seja, o meu processo vai assumir o 
                    //mesmo valor do TIE-BREAKER 
                    console.log(`* (class.app.js) Mensagem Inicial -> ${this._arrayProcessos[0].mensagem}`)
                    //verificar se o processo é defeituoso (se ele é ruim , não precisa entrar em acordo!!)
                    if (this._arrayProcessos[0].mensagem == 1 || this._arrayProcessos[0].mensagem == 0){
                       //se o valor inicial da msg do processo é DIFERENTE do Tie-Breaker, no final ele vai ter que assumir o valor do tie-breaker (ACORDO)
                        if (this._arrayProcessos[0].mensagem != arrayMsgsRecebidas[0].mensagem){
                            this._mensagemValorFinal = arrayMsgsRecebidas[0].mensagem;
                            console.log(`* (class.app.js) Assumiu Mensagem Tie-Breaker -> ${this._mensagemValorFinal}`)
                        }else{
                            this._mensagemValorFinal = this._arrayProcessos[0].mensagem;
                            console.log(`* (class.app.js) Manteve Mensagem Inicial -> ${this._mensagemValorFinal}`)
                        }
                    }else{
                        this._mensagemValorFinal = this._arrayProcessos[0].mensagem;
                        console.log(`* (class.app.js) Processo Defeituoso (manter msg inicial) -> ${this._mensagemValorFinal}`)
                    }
                    

                    //finalizando o processo: após receber a mensagem com o tie-breaker dos processos 1 e 2 podemos finalizar!
                    if (arrayMsgsRecebidas[0].nrProc == 1){tieBreakerProc1 = true;}
                    if (arrayMsgsRecebidas[0].nrProc == 2){tieBreakerProc2 = true;}
                    if (tieBreakerProc1 && tieBreakerProc2){
                        process.exit('Finalizado -  encontrou o tie-breaker!');
                    }
                    

                }else{
                    //preciso saber se a mensagem do proprio processo já está no arrayMsgsRecebidas
                    for (let procVerificar of arrayMsgsRecebidas){
                        if (procVerificar.nrProc == selfObjJsonEnviar.nrProc){
                            minhaMsgOK = true;
                        }
                    }
                    //caso a minha msg ainda não esteja no arrayMsgsRecebidas vamos incluir ela
                    if (!minhaMsgOK){
                        arrayMsgsRecebidas.push(this._objJsonEnviar);
                        // console.log(' * (class.app.js) incluiu a minha mensagem no arrayMsgsRecebidas')
                    }

                    //fazendo um print do arrayMsgsRecebidas cada vez que receber uma msg
                    for (let msgDaVez of arrayMsgsRecebidas){
                        console.log(`* (class.app.js) arrayMsgsRecebidas[]->  ${msgDaVez.nrProc}, ${msgDaVez.publicKey}, ${msgDaVez.mensagem}, ${msgDaVez.msgFromPhaseKing}, ${msgDaVez.mult}`);
                    }

                    //varrendo o arrayMsgsRecebidas (verificar se ainda existe alguma que veio que não tenho no arrayProcessos)
                    let msgDaVezJaExiste = false;
                    let multicastArrayProcessos = false;
                    for (let msgDaVez of arrayMsgsRecebidas){
                        
                        //verificando se a msgDaVez já existe no meu arrayProcessos
                        for(let item of selfArrayProcessos){
                            if (msgDaVez.nrProc == item.nrProc){
                                msgDaVezJaExiste = true;
                            }
                        }
                        //caso a mensagem recebida ainda não exista no meu arrayProcessos, incluir ela!
                        if (!msgDaVezJaExiste){
                            this.addMsgsArrayProcessos(msgDaVez);
                            multicastArrayProcessos = true;
                        }
                    }

                    //CASO EU TENHA INCLUÍDO UMA NOVA MSG no arrayProcessos (multicastArrayProcessos == true), 
                    //vou enviá-lo no multicast (para todos os processos verificarem se podem incluir algo no seu próprio array de processos)
                    if (multicastArrayProcessos){
                        await this.sendAllSocketMessage();
                        console.log(' * (class.app.js) MULTICAST - arrayProcessos enviado para membros...')                 
                    }

                    // ################## PHK ###################################################
                    // PHASE-KING: caso meu arrayProcessos tenha um tamanho == 5 vamos executar o phaseKing
                    if (selfArrayProcessos.length == 5){
                        console.log (`\n  * (class.app.js) >>>> PHASE-KING <<<<< todos os processos ativos :  Verificando... `);
                        //antes de passar o selfArrayProcessos para o PHK, vamos verificar se ainda existe alguma msg codificada! E fazer o decode se houver
                        //faço isso pois a msg do próprio processo foi incluída no constructor já usando encoded
                        selfArrayProcessos = await this.decodeArrayProc(selfArrayProcessos);
                        //setando o arrayProcessos para o  phaseKing
                        consensoPHK.setArrayProcessos(selfArrayProcessos);
                        //setando o objeto json enviado por este processo
                        consensoPHK.setObjJsonDesteProcesso(selfObjJsonEnviar);                        
                        //executando o consenso do Phase-King : o majority já é um objeto pronto para enviar caso o processo seja King
                        majority = consensoPHK.phaseKingConsensus();

                        //caso a resposta tenha sido uma msgFromPhaseKing == true : enviar ela para todos
                        if (majority.msgFromPhaseKing){
                            console.log(`\n * (class.app.js) >>>> Este é o Phase King:`);
                            console.log(`* (class.app.js) TIE-BREAKER ENVIADO -> NrProc KING[${majority.nrProc}], PubKey [${majority.publicKey}], Mensagem [${majority.mensagem}], FromPHK [${majority.msgFromPhaseKing}], Mult [${majority.mult}]`);
                            console.log(`* (class.app.js) Mensagem Inicial -> ${this._arrayProcessos[0].mensagem}`)
                            await this.sendAllSocketMessage([majority]);
                        }
                        console.log (`\n  * (class.app.js) >>>> PHASE-KING ... FIM!! <<<<<`);

                    }
                } //fim do ELSE do TIE-BREAKER

            });
        });
    }
    //enviar mensagem inicial (ou seja: envia o arrayProcessos deste app ou um array informado - inclusive as msgs com chaves públicas)
    async sendAllSocketMessage(mensagem){
        //caso a mensagem não tenha sido informada vamos assumir que é a propriedade arrayProcessos
        if (typeof mensagem === 'undefined' || mensagem == '' || mensagem == null){
            //convertendo para string (para facilitar envio)
            mensagem = JSON.stringify(this._arrayProcessos);
        }else{
            //caso contrario a mensagem é um array bruto... vou converter para string!
            mensagem = JSON.stringify(mensagem);
        }

        //enviando todo o meu array no buffer (multicast para todos os membros do grupo)
        for (let portaDaVez of this._arrayPortas){
            if (portaDaVez != this._porta){
                udpServer.send(Buffer.from(mensagem), portaDaVez, 'localhost');
            }
        }
     }

    //enviar mensagem apenas para o acompanhaConsensoMulticast.js (não estou mais usando)
    sendMessage (){
        //mensagem : 'nrProcesso#chavePub#mensagem'
        //aqui posso colocar um s.send para cada porta onde tem um processo ouvindo....
        //ou fazer apenas um s.send para o 41234 que é nosso verificador de processos que estão funcionando
        var objJson = { nrProc: 1, publicKey: 44, mensagem: 0 };
        var mensagem = JSON.stringify(objJson);
        udpServer.send(Buffer.from(mensagem), 41234, 'localhost');
    }

    async decodeArrayProc(arrayProc){
        for (let item of arrayProc){
            if (item.mensagem >= 11){
                item.mensagem = this.decodeMsg(item.mensagem, item.publicKey);
            }
        }
        return arrayProc;
    }

};





