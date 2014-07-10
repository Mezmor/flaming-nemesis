// demon.js
//
// file to bring together all the components
var EventEmitter = require("events").EventEmitter;
var Historical = require("./dataIO/historical");
var Durin = require("./advisor/durin");
var DummyTrader = require("./trader/dummy");

// constructor
function Demon(temporality, config) {
    this.config = config;
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
    
    EventEmitter.call(this);
    console.log("starting Demon");
    if (temporality === "bt") {
        this.initBT(config);
    } else {
        // live
    }
    this.dataIO.start();
}

// Inherit EventEmitter's prototype
Demon.prototype.__proto__ = EventEmitter.prototype;

// setup event handlers for data
Demon.prototype.setupDataEvents = function() {

    var startEvent = function() {
//        console.log("start!");
    //    winston.info("start event caught");
    };
    
    var newDataEvent = function(currentTransaction) {
        this.transactions.push(currentTransaction);
        if (this.initprice == 0) {
            this.initprice = currentTransaction.price;
        }
        while (this.transactions.length > 100) {
            this.transactions.shift();
        }
    };
    
    var candleEvent = function(candle, type) {
    //    winston.info("Found 1m candle: " + JSON.stringify(candle));
        this.candleHistories[type].push(candle);
        while (this.candleHistories[type].length > 100) {
            this.candleHistories[type].shift();
        }
        this.trader.placeOrder(this.advisor.advise(this.candleHistories, type), type, this.transactions, this.wallet);
    };
    
    var doneEvent = function() {
        console.log("Completed reading data");
        if (this.candleHistories["1m"].length > 0) {
            console.log("start $" + (this.config.dummyTrader.initialMoney + this.config.dummyTrader.initialAssets * this.initprice));
            console.log("end $" + (this.wallet.money + this.wallet.assets * this.candleHistories["1m"][this.candleHistories["1m"].length - 1].close));
        }
    };
    
    this.dataIO.on("start",
        startEvent.bind(this)).on("new-data",
        newDataEvent.bind(this)).on("candle",
        candleEvent.bind(this)).on("done",
        doneEvent.bind(this));
};

//initialize everything for backtest
Demon.prototype.initBT = function(config) {
    //
    // Instantiate the appropriate dataIO driver
    //
    if (config.mode.data === "historical") {
        this.dataIO = new Historical(config);
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
        this.trader = new DummyTrader(config);
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