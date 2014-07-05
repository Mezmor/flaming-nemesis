// demon.js
//
// file to bring together all the components
var Historical = require("./dataIO/historical");
var Durin = require("./advisor/durin");
var DummyTrader = require("./trader/dummy");
var config = require("./config");

// constructor
function Demon(temporality) {
    this.runmode = {};
    this.dataIO = {};
    this.advisor = {};
    this.trader = {};
    this.transactions = [];
    this.wallet = {};
    this.initprice = 0;
    this.candleHistories = {
        "1m" : [],
        "15m" : [],
        "1h" : [],
        "4h" : [],
        "24h" : []
    };
    console.log("starting Demon");
    if (temporality === "bt") {
        this.initBT();
    } else {
        // live
    }
    this.dataIO.start();
}

//bind events to event handlers for data
Demon.prototype.setupDataEvents = function() {
    this.dataIO.on("start", function() {
    //    winston.info("start event caught");
    }).on("new-data", function(currentTransaction) {
        this.demon.transactions.push(currentTransaction);
        if (this.demon.initprice == 0) {
            this.demon.initprice = currentTransaction.price;
        }
        while (this.demon.transactions.length > 100) {
            this.demon.transactions.shift();
        }
    }).on("candle", function(candle, type) {
    //    winston.info("Found 1m candle: " + JSON.stringify(candle));
        this.demon.candleHistories[type].push(candle);
        while (this.demon.candleHistories[type].length > 100) {
            this.demon.candleHistories[type].shift();
        }
        this.demon.trader.placeOrder(this.demon.advisor.advise(this.demon.candleHistories, type), type, this.demon.transactions, this.demon.wallet);
    }).on("done", function() {
        console.log("Completed reading data");
    //    for ( var candleType in candleHistories) {
    //        console.log(candleType + ": " + candleHistories[candleType].length);
    //    }
        console.log(this.demon.candleHistories["1m"][this.demon.candleHistories["1m"].length - 1]);  // TODO remove debug code
        console.log(this.demon.wallet);
        console.log("start $" + (config.dummyTrader.initialMoney + config.dummyTrader.initialAssets * this.demon.initprice));
        console.log("end $" + (this.demon.wallet.money + this.demon.wallet.assets * this.demon.candleHistories["1m"][this.demon.candleHistories["1m"].length - 1].close));
    });
};

//initialize everything for backtest
Demon.prototype.initBT = function() {
    //
    // Instantiate the appropriate dataIO driver
    //
    if (config.mode.data === "historical") {
        this.dataIO = new Historical(config.datafile, this);
        console.log("DataIO instantiated: historical");
    } else {
        // Instantiate the live driver
        console.log("Created new realtime");
    }

    //
    // Instantiate the appropriate advisor
    //
    if (config.mode.advisor === "durin") {
        this.advisor = new Durin();
        console.log("Advisor instantiated: Durin");
    } else {
        console.log("Unknown advisor");
    }

    //
    // Instantiate the appropriate trader
    //
    if (config.mode.trader === "dummyTrader") {
        this.trader = new DummyTrader();
        this.wallet.money = config.dummyTrader.initialMoney;
        this.wallet.assets = config.dummyTrader.initialAssets;
        console.log("Trader instantiated: Dummy");
    } else {
        console.log("Unknown trader");
    }
        
    //
    // Handle events
    //
    this.setupDataEvents();
};

//Expose the constructor
module.exports = Demon;