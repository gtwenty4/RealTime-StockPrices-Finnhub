const WebSocket = require('ws');

const events = require('events');
const eventEmitter = new events.EventEmitter();

const credential = require('./credentials.json');

//We use the Finnhub API to get the real time data of the stocks price
//To connect with Finnhub we need a authorization token
//This token can be created through her web page: https://finnhub.io/
//Finnhub documentation: https://finnhub.io/docs/api#introduction
const webSocketClient = new WebSocket(credential.finnhub.token);
const webSocketServer = new WebSocket.Server({ port: 3000 });

const instruments = ["MMM","BABA","ADDYY","GOOG","AMZN","AAL","AXP","AAPL","SAN",
  "BAC","BCS","BA","CAT","CVX","CSCO","C","KO","DWDP","XOM","FB","GE","GS","HSBC",
  "HD","INTC","IBM","JPM","JNJ","MCD","MRK","MSFT","MS","NFLX","NKE","PFE","PG",
  "SBUX","TSLA","TM","TWTR","UTX","UNH","VZ","V","WMT","DIS"
];

//Bind the web socket client to the Finnhub API open connection
webSocketClient.addEventListener("open", function (event) {
  //Send the subscribe request to all instruments
  for (let instrument of instruments) {
    webSocketClient.send(JSON.stringify({"type":"subscribe", "symbol":instrument}));
  }
});

//Bind the web socket client to the event message
//This event is trigger when finnhub send a price update
webSocketClient.addEventListener("message", (event) => {
  console.log("Message from finnhub server: ", event.data);
  //Trigger the data event and pass the arrive data like argument
  eventEmitter.emit('data',event.data);
});

//Execute the anonymous function when the data event is triggered
eventEmitter.addListener('data', (data) => {
  //Loop around all clients connected to the web socket server
  //This is for send a broadcast message with the price update
  webSocketServer.clients.forEach(function each(client) {
    //If the client connection is open, the websocket server send the arrival data
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
})