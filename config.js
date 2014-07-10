// config.js
var path = require("path");

function Config() {
    // Optional log file.  Uncomment to use.
    this.outfile = path.resolve(__dirname, "log.log").toString();
    
    // backtest mode
    this.backtest = {
        data : "historical",
        advisor : "durin",
        trader : "dummyTrader"
    };
    
     // live monitor mode
     // reads live data but does not do real trades
     this.liveMonitor = {
         data : "live",
         advisor : "durin",
         trader : "dummyTrader"
     };
    
     // live trade mode
     // reads live data, makes real trades
     this.liveTrade = {
         data : "live",
         advisor : "durin",
         trader : "realTrader"
     };
    
     // Set what mode we're using, needs to be after backtest declaration
     this.mode = this.backtest;
    
     // backtest-specific supplemental config options
     this.backtestSettings = {
         pullNew : false,
         startDate : "2014-01-01",
         datafile : "mtgoxRUB"
     };
    
     // dummy trader options
     this.dummyTrader = {
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

}

module.exports = Config;
