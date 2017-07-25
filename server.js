const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'))
	
app.post('/analyze', function(req, res) {
    //var dataInput = [req.body.filename];
});

io.on('connection', function(socket){
  console.log('a user connected');
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log('Drone 4 good demo app listening on port 3000')
});