# Phase King utilizando Node Js
Projeto sem interface gráfica (apenas no terminal). Simulação do algoritmo de consenso Phase King utilizando Node Js em um ambiente de multicast (localhost - simulando um processo REST em portas diferentes)
1) tenha o node js instalado
2) instale as dependências (node_modules) usando o "npm install" (para as dependências listadas no package-lock.json)
3) execute em um terminal separado o monitor (vai listar todas as mensagens):

>> node acompanhaConsensoMulticast.js

4) Para executar os processos que fazem parte do multicast:

>> node executeApp1.js

>> node executeApp2.js

>> node executeApp3.js

>> node executeApp4.js

>> node executeApp5.js


# Phase King with Node Js
This script does not use a graphic interface (only the terminal) It simulates the Phase King Algorithm implemented with Node Js and a Multicast environment (localhost - each process is running as a REST in a specific port ) To execute it you´ll need:
1) Node Js must be already installed
2) All dependencies (node_modules) - just execute "npm install" to do it and grab all from package-lock.json
3) execute the monitor (it will show all the messages in the multicast):

>> node acompanhaConsensoMulticast.js

4) Execute each process to send/receive the messages - after execute the last one Phase King starts:
>> node executeApp1.js

>> node executeApp2.js

>> node executeApp3.js

>> node executeApp4.js

>> node executeApp5.js
