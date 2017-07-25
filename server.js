const express = require('express');
const app = express();


app.use(express.static('public'))

    var port = process.env.PORT || 3000;
    app.listen(port, function () {
        console.log('Drone 4 good demo app listening on port 3000')
    });
	
app.post('/analyze', function(req, res) {
    // For now just get an array from the client..
    var dataInput = [req.body.payload];
    model.eval(dataInput, (err, evalResult) =>{
        if (err) {
            console.info('Error during eval:', err);
            res.end(err.toString(), 400);
            return;
        }

        // so we use argmax to get the index of the highest value
        var digit = cntk.utils.argmax(evalResult.output[0]);
        responseBody = JSON.stringify({
            'digit' : digit
        });

        console.info('Request processed, recognized digit is: ', digit)

        res.end(responseBody , 200);
    });
});

