// config.js

// Optional log file.  Uncomment to use.
//config.outfile = "outfile.log"

// Set what mode we're using
config.mode = backtest;

// backtest mode
var backtest = {
  dataIO: "historicalIO",
  advisor: "EMA",
  trader: "dummyTrader"
};

// live monitor mode
// reads live data but does not do rela trades
var liveMonitor = {
  dataIO: "liveIO",
  advisor: "EMA",
  trader: "dummyTrader"
};

// live trade mode
// reads live data, makes real trades
var liveTrade = {
  dataIO: "liveIO",
  advisor: "EMA",
  trader: "realTrader"
}

// backtest-specific supplementatl config options
config.backtest = {
  pullNew: true
  candleRanges: [60,900,3600,14400,86400]
}
