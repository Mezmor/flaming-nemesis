// nemesis.js
// The main handler for all things Balrog
var config = require("./config");
var winston = require("winston");
var Historical = require("./dataIO/historical");

// Init logger
// Init data-parser
// Init advisor
// Init trader

// Add file transport to winston, console is set by default
// Current settings: log everything to console + file
winston.add(winston.transports.File, { filename: config.outfile });

// Instantiate the appropriate dataIO driver
var dataIO;
if (config.mode.data === "historical") {
    dataIO = new Historical(config.datafile);
    console.log("Created new historical");
} else {
    // Instantiate the live driver
    console.log("Created new realtime");
}

candleHistories = {
    "1m" : [],
    "15m" : [],
    "1h" : [],
    "4h" : [],
    "24h" : []
};

dataIO.on("start", function() {
    winston.info("start event caught");
}).on("candle-1m", function(candle) {
    winston.info("Found 1m candle: " + JSON.stringify(candle));
    candleHistories["1m"].push(candle);
}).on("candle-15m", function(candle) {
    winston.info("Found 15m candle: " + JSON.stringify(candle));
    candleHistories["15m"].push(candle);
}).on("candle-1h", function(candle) {
    winston.info("Found 1h candle: " + JSON.stringify(candle));
    candleHistories["1h"].push(candle);
}).on("candle-4h", function(candle) {
    winston.info("Found 4h candle: " + JSON.stringify(candle));
    candleHistories["4h"].push(candle);
}).on("candle-24h", function(candle) {
    winston.info("Found 24h candle: " + JSON.stringify(candle));
    candleHistories["24h"].push(candle);
}).on("done", function() {
    console.log("Completed reading historical data");
    for ( var candleType in candleHistories) {
        console.log(candleType + ": " + candleHistories[candleType].length);
    }
});

dataIO.start();