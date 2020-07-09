module.exports =  class phaseKing {
    //construtor da classe
    constructor() {
        this._arrayProcessos = [];
        this._arrayRecebidoPphase = [];
        this._objJsonDesteProcesso = new Object();
        // console.log('entrou no constructor!')
    }


    //setters
    setArrayProcessos(arrayProc) {
       this._arrayProcessos = arrayProc;  
    }

    setObjJsonDesteProcesso(objJson){
        this._objJsonDesteProcesso = objJson;
    }
    
    setArrayRecebidoPphase(arrayRecebido){
        this._arrayRecebidoPphase = arrayRecebido;
    }
    
    
    //##### metodos gerais da classe
    //phase king - recebe o this._arrayProcessos (nr procs, chaves, msgs )
    phaseKingConsensus(v){
        if (typeof v === 'undefined' || v == '' || v == null){
            //inicializando o array de mensagens recebidas via multicast
            v = this._arrayProcessos
        }
        var f = 1; //nr máximo de processos falhos/malicious
        var majority = new Object();
        var i = this._objJsonDesteProcesso.nrProc;  //nr do processo que chamou o metodo phase-king
        var n = 5; //nr de processos que participam deste multicast

        for (let phase = 1; phase <= f + 1; phase++){
            //ROUND 1
            // a inicialização de "v " foi realizada no início do método
            //verificando a majority (o valor que aparece mais do que n/2 vezes nas msgs recebidas)
            //objeto : majority.mensagem    e    majority.mult
            //note que aqui tenho v <-- majority
            majority = this.verifyMajority(v);
            
            //ROUND 2
            //se o processo é KING da vez, vai enviar para todos o seu majority
            if (i == phase){
                // console.log (`* (class.consensoPhaseKing.js) entrou no if i == phase ->  ${i} == ${phase}`);
                //retornar o majority para multicast!
                majority.msgFromPhaseKing = true;
                return majority;
            }
            
            //verificar se recebeu o tiebreaker do Pphase (receive tie-breaker)
            // if (v[0].msgFromPhaseKing){
            //     console.log (`* (class.consensoPhaseKing.js) entrou no if msgFromPhaseKing ->  ${v[0].msgFromPhaseKing} `);
            //     //se o mult já é maioria retornamos o majority encontrado
            //     if (mult > n/2 ){ //ALTERAÇÃO DA LINHA 1K CONFORME INFORMAÇÃO DO TEAMS
            //         //nada acontece ... nao vou retornar agora pois isso sera feito no final
            //         //return majority;
            //     //se o mult NÃO é maioria, o valor do majority recebe o tie-breaker
            //     }else{
            //         majority.mensagem = v[0].mensagem
            //     }
            // }

            //verificação para todos que venham do phaseKing
            if (mult > n/2 && v[0].msgFromPhaseKing){
                majority = this.verifyMajority(v); 
            }else{
                majority.mensagem = v[0].mensagem
            }

            //return do ROUND2 apenas se:
            if (phase == f + 1){
                console.log(`* (class.consensoPhaseKing.js) Tie-Breaker PHK Round2 [VALOR=>>> ${majority.mensagem}, MULT=>> ${majority.mult}  ]`);
                return majority;
            }


        }
        
        

        console.log('* (class.consensoPhaseKing.js) >>>>>>>>>>>> fim do  consensus <<<<<<<<<<<<<');

    }

    //verificar majority no array (já com a msg decodificada) informado
    verifyMajority(arrayVerificar){
        var qtdMsg0 = 0;
        var qtdMsg1 = 0;
        var qtdMsgRuim = 0;
        var majorityRetorno = new Object();

        for (let itemDaVez of arrayVerificar){
            // contador mensagens == 0
            if(itemDaVez.mensagem == 0){qtdMsg0++;}
            // contador mensagens == 1
            if(itemDaVez.mensagem == 1){qtdMsg1++;}
            // contador mensagens malicious
            if(itemDaVez.mensagem != 0 && itemDaVez.mensagem != 1){qtdMsgRuim++;}
        }
        //verificando qual será retornada
        if (qtdMsg0 > qtdMsg1){
            majorityRetorno.mensagem = 0;
            majorityRetorno.mult = qtdMsg0;
            majorityRetorno.qtdMsgRuim = qtdMsgRuim;
            // console.log('* (class.consensoPhaseKing.js) quantidade de msgs 0 >  1');
        } else if (qtdMsg1 > qtdMsg0){
            majorityRetorno.mensagem = 1;
            majorityRetorno.mult = qtdMsg1;
            majorityRetorno.qtdMsgRuim = qtdMsgRuim;
            // console.log('* (class.consensoPhaseKing.js) quantidade de msgs 1 >  0');
        //caso qtdMsg1 == qtdMsg0 então ESCOLHER VALOR DEFALUT = 0
        }else{
            // console.log('* (class.consensoPhaseKing.js) quantidade de msgs 0 == msgs 1');
            majorityRetorno.mensagem = 0;
            majorityRetorno.mult = qtdMsg0;
            majorityRetorno.qtdMsgRuim = qtdMsgRuim;
        }
        //precisa deste campo em qq um dos casos
        majorityRetorno.msgFromPhaseKing = false;
        majorityRetorno.nrProc = this._objJsonDesteProcesso.nrProc;
        majorityRetorno.publicKey = this._objJsonDesteProcesso.publicKey;

        console.log(`* (class.consensoPhaseKing.js) Majority PHK Round1 [VALOR=>>> ${majorityRetorno.mensagem}, MULT=>> ${majorityRetorno.mult}  ]`);
        //retornar este objeto
        return majorityRetorno;
    }

    //impressao do array de processos
    imprimeProcs() {
        for (let item of this._arrayProcessos){
        //   console.log(`conteúdo do arrayProcessos => ${item}`);
          console.log(`* (class.consensoPhaseKing.js) arrayProcessos [nrPrc ->>> ${item.nrProc}, pk ->>> ${item.publicKey}, msg ->>> ${item.mensagem} ]`);
        }
    }

  }
