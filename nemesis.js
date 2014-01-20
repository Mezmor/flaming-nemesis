// nemesis.js
// The main handler for all things Balrog
var config = require("./config");
var winston = require("winston");
var Historical = require("./dataIO/historical");
var Durin = require("./advisor/durin");
var DummyTrader = require("./trader/dummy");

// Add file transport to winston, console is set by default
// Current settings: log everything to console + file
//winston.add(winston.transports.File, { filename: config.outfile });
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

transactions = [];

wallet = {};

initprice = 0;

//
//Instantiate the appropriate advisor
//
var advisor;
if (config.mode.advisor === "durin") {
    advisor = new Durin();
    console.log("Durin welcomes you into his lair");
} else {
    console.log("Unknown advisor");
}

//
//Instantiate the appropriate trader
//
var trader;
if (config.mode.trader === "dummyTrader") {
  trader = new DummyTrader();
  wallet.money = config.dummyTrader.initialMoney;
  wallet.assets = config.dummyTrader.initialAssets;
  console.log("Dummy trader initialized");
} else {
  console.log("Unknown trader");
}


dataIO.on("start", function() {
//    winston.info("start event caught");
}).on("new-data", function(currentTransaction) {
    transactions.push(currentTransaction);
    if (initprice == 0) {
        initprice = currentTransaction.price;
    }
    if (transactions.length > 100) {
        transactions.shift();
    }
}).on("candle-1m", function(candle) {
//    winston.info("Found 1m candle: " + JSON.stringify(candle));
    candleHistories["1m"].push(candle);
    if (candleHistories["1m"].length > 100) {
        candleHistories["1m"].shift();
    }
    trader.placeOrder(advisor.advise(candleHistories, "1m"), "1m", transactions, wallet);
}).on("candle-15m", function(candle) {
//    winston.info("Found 15m candle: " + JSON.stringify(candle));
    candleHistories["15m"].push(candle);
    if (candleHistories["15m"].length > 100) {
        candleHistories["15m"].shift();
    }
    trader.placeOrder(advisor.advise(candleHistories, "15m"), "15m", transactions, wallet);
}).on("candle-1h", function(candle) {
//    winston.info("Found 1h candle: " + JSON.stringify(candle));
    candleHistories["1h"].push(candle);
    if (candleHistories["1h"].length > 100) {
        candleHistories["1h"].shift();
    }
    trader.placeOrder(advisor.advise(candleHistories, "1h"), "1h", transactions, wallet);
}).on("candle-4h", function(candle) {
//    winston.info("Found 4h candle: " + JSON.stringify(candle));
    candleHistories["4h"].push(candle);
    if (candleHistories["4h"].length > 100) {
        candleHistories["4h"].shift();
    }
    trader.placeOrder(advisor.advise(candleHistories, "4h"), "4h", transactions, wallet);
}).on("candle-24h", function(candle) {
//    winston.info("Found 24h candle: " + JSON.stringify(candle));
    candleHistories["24h"].push(candle);
    if (candleHistories["24h"].length > 100) {
        candleHistories["24h"].shift();
    }
    trader.placeOrder(advisor.advise(candleHistories, "24h"), "24h", transactions, wallet);
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

dataIO.start();
