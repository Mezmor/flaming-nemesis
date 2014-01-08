// historical.js
// Driver responsible for reading historical transaction data and building variable length candles
var EventEmitter = require("events").EventEmitter;
var fs = require("fs");
var config = require("../config");
var winston = require("winston");
var url = require('url');
var http = require('http');

// Constructor, we call EventEmitter's constructor because we subclass it
var Historical = function(datafile) {
    this.data = datafile;
    EventEmitter.call(this);
};

// Inherit EventEmitter's prototype
Historical.prototype.__proto__ = EventEmitter.prototype;

Historical.prototype.start = function() {
    // Begin reading data
    this.emit("start"); // Test emit
    if (config.backtest.pullNew || !fs.existsSync(this.data)) {
        var dataURL = "http://api.bitcoincharts.com/v1/csv/" + this.data.split("\\").pop();
        this.downloadData(dataURL, this.read.bind(this));
    } else {
        this.read();
    }
};

// Assumes the data to be structured as: (time, price, volume)
Historical.prototype.read = function() {
    winston.info("Using data file1 " + this.data);
    var array = fs.readFileSync(this.data).toString().split('\n');
    // Candles are: (1m [60s], 15m [900s], 1h [3600s], 4h [14400s], 24h
    // [86400s])
    // Candle: start, open, low, high, close
    candles = {
        "1m" : {},
        "15m" : {},
        "1h" : {},
        "4h" : {},
        "24h" : {}
    };
    
    var previousTransaction = {};
    
    for (var i = 0; i < array.length; i++) {
        var line = array[i].split(",");
        var currentTransaction = {
            "time" : line[0],
            "price" : line[1],
            "volume" : line[2]
        };
        
        if (!previousTransaction) {
            previousTransaction = currentTransaction;
        }

        // Update each candle
        for ( var candleType in candles) {
            var candle = candles[candleType];
            if (!candle.start) {
                // This is a new candle!
                initData(candle, currentTransaction);
            } else {
                // If we complete a candle, we emit the current candle.
                // We don't add the currentTransaction to the current candle
                // Otherwise we add the current transaction data to the candle
                var timeDelta = currentTransaction.time - candle.start;
//                console.log(candleType + ": " + timeDelta);
                if ((timeDelta > 86400) & (candleType === "24h")) {
                    candle.close = previousTransaction.price; // Close is the
                                                                // last
                                                                // transaction's
                                                                // price
                    this.emit("candle-24h", candle);
                    candles[candleType] = {};
                    initData(candle, currentTransaction);
                } else if ((timeDelta > 14400) & (candleType === "4h")) {
                    candle.close = previousTransaction.price; // Close is the
                                                                // last
                                                                // transaction's
                                                                // price
                    this.emit("candle-4h", candle);
                    candles[candleType] = {};
                    initData(candle, currentTransaction);
                } else if ((timeDelta > 3600) & (candleType === "1h")) {
                    candle.close = previousTransaction.price; // Close is the
                                                                // last
                                                                // transaction's
                                                                // price
                    this.emit("candle-1h", candle);
                    candles[candleType] = {};
                    initData(candle, currentTransaction);
                } else if ((timeDelta > 900) & (candleType === "15m")) {
                    candle.close = previousTransaction.price; // Close is the
                                                                // last
                                                                // transaction's
                                                                // price
                    this.emit("candle-15m", candle);
                    candles[candleType] = {};
                    initData(candle, currentTransaction);
                } else if ((timeDelta > 60) & (candleType === "1m")) {
                    candle.close = previousTransaction.price; // Close is the
                                                                // last
                                                                // transaction's
                                                                // price
                    this.emit("candle-1m", candle);
                    candles[candleType] = {};
                    initData(candle, currentTransaction);
                } else {
                    // Add transaction data to candle
                    if (currentTransaction.price > candle.high) {
                        // This is a new high
                        candle.high = currentTransaction.price;
                    } else if (currentTransaction.price < candle.low) {
                        // This is a new low
                        candle.low = currentTransaction.price;
                    }
                }
            }
        }
        previousTransaction = currentTransaction;
    }
    this.emit("done");
};

// Initialize a candle with the currentTransaction
function initData(candle, currentTransaction) {
    candle.start = currentTransaction.time;
    candle.open = currentTransaction.price;
    candle.high = candle.low = currentTransaction.price;
};

// Download data file from URL
// code from http://www.hacksparrow.com/using-node-js-to-download-files.html
Historical.prototype.downloadData = function(file_url, cb) {
    winston.info("Downloading data file " + file_url);
    var downloadDir = 'data/';

    // We will be downloading the files to a directory, so make sure it's there
    // This step is not required if you have manually created the directory
    fs.mkdir(downloadDir, function(err) {
        if (err && err.code != 'EEXIST') throw err;
        else download_file_httpget(file_url);
    });

    // Function to download file using HTTP.get
    var download_file_httpget = function(file_url) {
    var options = {
        host: url.parse(file_url).host,
        port: 80,
        path: url.parse(file_url).pathname
    };

    var file_name = url.parse(file_url).pathname.split('/').pop();
    var file = fs.createWriteStream(downloadDir + file_name);

    http.get(options, function(res) {
        res.on('data', function(data) {
                file.write(data);
            }).on('end', function() {
                file.end();
                winston.info(file_name + ' downloaded to ' + downloadDir);
                cb();
            });
        });
    };
};

// Set Historical's prototype functions:
// convert trade data into candlestick data at different ranges
// emit the "candle-found" event, listeners will act appropriately 

//Expose the constructor
module.exports = Historical;