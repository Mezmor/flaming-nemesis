// nemesis.js
// The main handler for all things Balrog
var config = require("./config");
var winston = require("winston");
var Iface = require("./util/interface");
var Historical = require("./dataIO/historical");
var Durin = require("./advisor/durin");
var DummyTrader = require("./trader/dummy");

//
// Global variables
//
var runmode = {};
var dataIO = {};
var advisor = {};
var trader = {};
var transactions = [];
var wallet = {};
var initprice = 0;
var candleHistories = {
    "1m" : [],
    "15m" : [],
    "1h" : [],
    "4h" : [],
    "24h" : []
};

//
// Global functions
//
// bind events to event handlers for data
function setupDataEvents() {
    dataIO.on("start", function() {
    //    winston.info("start event caught");
    }).on("new-data", function(currentTransaction) {
        transactions.push(currentTransaction);
        if (initprice == 0) {
            initprice = currentTransaction.price;
        }
        while (transactions.length > 100) {
            transactions.shift();
        }
    }).on("candle", function(candle, type) {
    //    winston.info("Found 1m candle: " + JSON.stringify(candle));
        candleHistories[type].push(candle);
        while (candleHistories[type].length > 100) {
            candleHistories[type].shift();
        }
        trader.placeOrder(advisor.advise(candleHistories, type), type, transactions, wallet);
    }).on("done", function() {
        console.log("Completed reading data");
    //    for ( var candleType in candleHistories) {
    //        console.log(candleType + ": " + candleHistories[candleType].length);
    //    }
        console.log(candleHistories["1m"][candleHistories["1m"].length - 1]);  // TODO remove debug code
        console.log(wallet);
        console.log("start $" + (config.dummyTrader.initialMoney + config.dummyTrader.initialAssets * initprice));
        console.log("end $" + (wallet.money + wallet.assets * candleHistories["1m"][candleHistories["1m"].length - 1].close));
    });
}

// initialize nemesis
function Init() {
    //
    // Set up Winston for Logging
    //
    // Add file transport to winston, console is set by default
    // Current settings: log everything to console + file
    // winston.add(winston.transports.File, { filename: config.outfile });
    winston.remove(winston.transports.Console);
}

// initialize everything for backtest
function InitBT() {
    //
    // Instantiate the appropriate dataIO driver
    //
    if (config.mode.data === "historical") {
        dataIO = new Historical(config.datafile);
        console.log("DataIO instantiated: historical");
    } else {
        // Instantiate the live driver
        console.log("Created new realtime");
    }

    //
    // Instantiate the appropriate advisor
    //
    if (config.mode.advisor === "durin") {
        advisor = new Durin();
        console.log("Advisor instantiated: Durin");
    } else {
        console.log("Unknown advisor");
    }

    //
    // Instantiate the appropriate trader
    //
    if (config.mode.trader === "dummyTrader") {
        trader = new DummyTrader();
        wallet.money = config.dummyTrader.initialMoney;
        wallet.assets = config.dummyTrader.initialAssets;
        console.log("Trader instantiated: Dummy");
    } else {
        console.log("Unknown trader");
    }
        
    //
    // Handle events
    //
    setupDataEvents();
}

//
// Do it
//
Init();
Iface();
//dataIO.start();



