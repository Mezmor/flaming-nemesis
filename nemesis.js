// nemesis.js
// The main handler for all things Balrog
var config = require("./config");
var winston = require("winston");
var Historical = require("./dataIO/historical");
var Durin = require("./advisor/durin");

// Init logger [check]
// Init data-parser [check: historical only]
// Init advisor
// Init trader

// Add file transport to winston, console is set by default
// Current settings: log everything to console + file
winston.add(winston.transports.File, { filename: config.outfile });
winston.remove(winston.transports.Console);

//
// Instantiate the appropriate dataIO driver
//
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

// TODO add a parameter that lets us know how far into the current time period
// we are for each candle so we can use that as a weighting factor in advisor
// calculations
currentCandles = {};

//
//Instantiate the appropriate advisor
//
var advisor;
if (config.mode.advisor === "durin") {
    advisor = new Durin();
    console.log("Durin welcomes you into his lair");
} else {
    // Instantiate the live driver
    console.log("Unknown advisor");
}

dataIO.on("start", function() {
    winston.info("start event caught");
}).on("new-data", function(candles) {
    currentCandles = candles;
}).on("candle-1m", function(candle) {
    winston.info("Found 1m candle: " + JSON.stringify(candle));
    candleHistories["1m"].push(candle);
    advisor.advise(candleHistories, currentCandles, "1m");
}).on("candle-15m", function(candle) {
    winston.info("Found 15m candle: " + JSON.stringify(candle));
    candleHistories["15m"].push(candle);
    advisor.advise(candleHistories, currentCandles, "15m");
}).on("candle-1h", function(candle) {
    winston.info("Found 1h candle: " + JSON.stringify(candle));
    candleHistories["1h"].push(candle);
    advisor.advise(candleHistories, currentCandles, "1h");
}).on("candle-4h", function(candle) {
    winston.info("Found 4h candle: " + JSON.stringify(candle));
    candleHistories["4h"].push(candle);
    advisor.advise(candleHistories, currentCandles, "4h");
}).on("candle-24h", function(candle) {
    winston.info("Found 24h candle: " + JSON.stringify(candle));
    candleHistories["24h"].push(candle);
    advisor.advise(candleHistories, currentCandles, "24h");
}).on("done", function() {
    console.log("Completed reading data");
    for ( var candleType in candleHistories) {
        console.log(candleType + ": " + candleHistories[candleType].length);
    }
    console.log(candleHistories["1m"][0]);  // TODO remove debug code
    // Trader summarizes earnings here
});

dataIO.start();
