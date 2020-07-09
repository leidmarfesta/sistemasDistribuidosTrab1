

//classe do processo app1
var classApp = require('./class.app');

//instanciando objeto da classApp1 - incializar indicando a PORTA do listen + nrProc + mensagem
var app = new classApp(3059,1,1);

//executando os métodos para listen e send:

//inicializa as variaveis para enviar msg: nrProc, PublicKey e mensagem 
app.printPublicVarMsg();
//começa a ouvir na porta especificada
app.startListen();       
app.sendAllSocketMessage(); //ele envia: nrProc, PK, msg