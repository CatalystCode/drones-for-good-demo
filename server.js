const express = require('express');
const app = express();


app.use(express.static('public'))

    var port = process.env.PORT || 3000;
    app.listen(port, function () {
        console.log('Drone 4 good demo app listening on port 3000')
    });
	
app.post('/analyze', function(req, res) {
    var dataInput = [req.body.filename];
);
});
