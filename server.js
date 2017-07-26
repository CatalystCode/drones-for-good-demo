require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const alerts = require('./storage/alerts');
const bodyParser = require('body-parser');
const videoutil = require('./videoutils');

app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  
// Polling 
const config = {
  queueName: 'alerts', 
  accountName: process.env.ACCOUNT_NAME, 
  accountKey: process.env.ACCOUNT_KEY
}

app.post('/analyze', function(req, res) {
    var filePath = req.body.filename;
    videoutil.processFile(filePath, config.accountName, config.accountKey);
    console.log('Video ' + filePath + ' is being processed')
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



alerts.pollQueue(config.queueName, config.accountName, config.accountKey, 1000, message => {
  io.emit('new alert', message);
});

var port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Drone 4 good demo app listening on port 3000')
});