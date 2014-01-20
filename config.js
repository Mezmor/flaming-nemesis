// config.js
var path = require("path");

var config = {};

// Optional log file.  Uncomment to use.
config.outfile = path.resolve(__dirname, "log.log").toString();

config.datafile = path.resolve(__dirname, "data/mtgoxRUB.csv").toString();

// backtest mode
var backtest = {
    data : "historical",
    advisor : "durin",
    trader : "dummyTrader"
};

// live monitor mode
// reads live data but does not do real trades
var liveMonitor = {
    data : "live",
    advisor : "durin",
    trader : "dummyTrader"
};

// live trade mode
// reads live data, makes real trades
var liveTrade = {
    data : "live",
    advisor : "durin",
    trader : "realTrader"
};

// Set what mode we're using, needs to be after backtest declaration
config.mode = backtest;

// backtest-specific supplemental config options
config.backtest = {
    pullNew : false,
    startDate: "2013-12-01"
};

// dummy trader options
config.dummyTrader = {
    initialMoney : 2000,
    initialAssets : 3,
    tradePercentages : {
        "1m"  : 0.80,
        "15m" : 0.00,
        "1h"  : 0.00,
        "4h"  : 0.20,
        "24h" : 0.80
    },
    assetReservePercentage : 0.33,
    fee : 0.002,
    inefficiency : 0.01
};

module.exports = config;
