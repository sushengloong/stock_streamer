var express = require('express')
, sio = require('socket.io')
, http = require('http')
, quoteSubscriptions = require('quote_subscriptions')
, app = express();

var server = http.createServer(app);
var sequence = 0;
app.configure(function () {
app.use(express.static(__dirname + '/public'));
app.use(app.router);
})

var io = sio.listen(server);
io.set('log level', 1);
server.listen(8080);

io.sockets.on('connection', function(socket) {
// subscribe to stock quotes
socket.on('subscribe-stock-quote', function(symbol) {
   console.log('subscribe-stock-quote received');
   quoteSubscriptions.subscribe(socket, symbol, function() {
      socket.emit('subscribed-stock-quote', 'You have been subscribed to ' + symbol);
   });
});

// unsubscribe to stock quotes
socket.on('unsubscribe-stock-quote', function (symbol) {
   console.log('unsubscribe-stock-quote received');
   quoteSubscriptions.unsubscribe(socket, symbol, function() {
      socket.emit('unsubscribed-stock-quote received', 'You have been unsubscribed to ' + symbol);
   });
});

// disconnected
socket.on('disconnect', function() {
   quoteSubscriptions.unsubscribeAll(socket, function() {
      socket.emit('disconnected', socket.symbol + ' has been unsubscribed from stock quotes.');
   });
});
});

// update clients every 500 milli-seconds with latest stock quotes
setInterval(function () {
quoteSubscriptions.pushUpdates();
io.sockets.emit('sequence', ++sequence);
}, 500);
