const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const alerts = require('./storage/alerts');

app.use(express.static('public'));
	
app.post('/analyze', (req, res) => {
    //var dataInput = [req.body.filename];
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', msg => {
    console.log('message: ' + msg);
  });
});

// Polling 
const config = {
  queueName: 'alerts', 
  accountName: 'drones4goodstore', 
  accountKey: '8aK9lKtBoyV++Af371a56aQPzh4gPGMT+8c5NQ/n9AfOAEFLPIb4BrOENxRo+MgOeHpTQLyP73mGzmBbyo9x9A=='
}

alerts.pollQueue(config.queueName, config.accountName, config.accountKey, 1000, message => {
  io.emit('new alert', message);
});

var port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Drone 4 good demo app listening on port 3000')
});