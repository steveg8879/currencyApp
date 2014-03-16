//===================== Modules Section ==========================
var http = require('http');
var express = require('express'); // Express is used for handling our API calls
require('date-utils'); // Date-Utils is used to extend the Date() functionality
var mongodb = require('mongodb');
var server = new mongodb.Server("127.0.0.1", 27017, {});
var APIrequests;
new mongodb.Db('currencyApp', server, {w:1}).open(function (error, client) {
    if (error) throw error;
    APIrequests = new mongodb.Collection(client, 'APIrequests');
});


//===================== Express Setup ==========================

var app = express();
app.use(express.bodyParser());
app.use(express.compress());
app.use(express.static(__dirname + '/public'));
app.post('/convertUSD', function(request, response){
    var data = '';
    http.get("http://openexchangerates.org/api/latest.json?app_id=b190a168472845cd9091fb52395a968e", function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function() {
            var d = new Date();
            data = JSON.parse(data);
            var amount = request.body.amount;
            APIrequests.insert({userAgent: request.headers['user-agent'], dollarAmount: amount, timestamp: d.toFormat('MM:DD:YYYY HH24:MI:SS'), ipAddress: request.connection.remoteAddress}, function(){
                response.json({cad: (amount * data.rates.CAD).toFixed(2), eur: (amount * data.rates.EUR).toFixed(2), gbp: (amount * data.rates.GBP).toFixed(2)});
            });
        });
    }).on('error', function(e) {
        response.send("Got error: " + e.message);
    });
});
app.listen(8088);