module.exports =  class auxiliares {
  //construtor da classe
  constructor() {
    this._arrayProcessos = [];
    // console.log('constructor de métodos auxiliares!')
  }

  //setters
  setArrayProcessos(arrayProc) {
      this._arrayProcessos = arrayProc;  
  }
  //##### metodos gerais da classe

  //separa a string em um array e monta o objeto
  async stringMsgToObject(stringMsg){
      let arrayResult = stringMsg.split('#');
      // console.log('funções auxiliares->', arrayResult);
      let objResult = new Object();
        objResult.nrProc = arrayResult[0];
        objResult.publicKey = arrayResult[1];
        objResult.mensagem = arrayResult[2];
      return objResult;
  }

  //transforma um array 

} 
