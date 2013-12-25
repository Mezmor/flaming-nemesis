// config.js
var path = require("path");

var config = {};

// Optional log file.  Uncomment to use.
config.outfile = path.resolve(__dirname, "outfile.log").toString();

config.datafile = path.resolve(__dirname, "data/mtgoxRUB.csv").toString();

// backtest mode
var backtest = {
  data: "historical",
  advisor: "EMA",
  trader: "dummyTrader"
};

//live monitor mode
//reads live data but does not do rela trades
var liveMonitor = {
data: "live",
advisor: "EMA",
trader: "dummyTrader"
};

//live trade mode
//reads live data, makes real trades
var liveTrade = {
data: "live",
advisor: "EMA",
trader: "realTrader"
};

//Set what mode we're using, needs to be after backtest declaration
config.mode = backtest;


// backtest-specific supplementatl config options
config.backtest = {
  pullNew: true,
  candleRanges: [60,900,3600,14400,86400]
};

module.exports = config;