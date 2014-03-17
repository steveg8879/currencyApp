//===================== Modules Section ==========================
var http = require('http');
var express = require('express'); // Express is used for handling our API calls
require('date-utils'); // Date-Utils is used to extend the Date() functionality


//=================== Mongo Config ============================

var mongodb = require('mongodb'); // MongoDB is a client to connect to MongoDB
var server = new mongodb.Server("127.0.0.1", 27017, {}); // Create connection to Mongo Service
var APIrequests;
new mongodb.Db('currencyApp', server, {w:1}).open(function (error, client) {
    if (error) throw error;
    APIrequests = new mongodb.Collection(client, 'APIrequests'); // Add collection to manage
});


//===================== Express Setup ==========================

var app = express();
app.use(express.bodyParser()); // Used to parse the body of requests
app.use(express.compress()); // Used for compression of responses
app.use(express.static(__dirname + '/public')); // Used to serve static files from the /public directory


//========================== API ===============================

/*
This section creates an API endpoint of 'convertUSD'. The API accepts a POST with JSON data that contains an amount (key) value.
When a POST comes in a GET request is made to the openexchangerates.org API, which provides a JSON response of current exchange rates.
The function then performs a calculation of (dollar amount posted * specified exchange rate) and returns the values in a JSON response.
The function also writes a record of the request to a MongoDB DB instance called currencyApp in a collection called APIrequests. 
 */

app.post('/convertUSD', function(request, response){ // Define the API endpoint
    var data = '';
    http.get("http://openexchangerates.org/api/latest.json?app_id=b190a168472845cd9091fb52395a968e", function(res) { // Begin request to the openexchangerates.org API
        res.setEncoding('utf8');
        res.on('data', function (chunk) { // This function takes the chunked responses from the request and adds them to the 'data' string
            data += chunk;
        });
        res.on('end', function() { // Once the request has ended the function will turn the data string into an object, write a record to the DB and perform the calculations to be provided in the JSON response
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
app.listen(8088); // This is the port that the web service is listening on
