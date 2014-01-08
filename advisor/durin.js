// Gandalf ain't got shit on me.

var EventEmitter = require("events").EventEmitter;
var config = require("../config");
var winston = require("winston");

//Constructor, we call EventEmitter's constructor because we subclass it
var Durin = function() {
    EventEmitter.call(this);
};

// Inherit EventEmitter's prototype
Durin.prototype.__proto__ = EventEmitter.prototype;

Durin.prototype.advise = function(candleHistories, currentCandles, timeLen) {
    // based on current and historical candles, output a "buy" "sell" or "hold"
    // order for each time period: 1m, 15m, 1h, 4h, 24h
    //
    // these are emitted as events that the trader will react to.
    // the trader will cancel any previous orders not filled, and place a new
    // order.
    var advice;
    var candleHistory = candleHistories[timeLen];
    var currentCandle = currentCandles[timeLen];

    var macdLine = this.MACD(candleHistory, currentCandle, 12, 26);
    var signalLine= this.EMA(candleHistory, currentCandle, 9);
    
    /* If the signal line is above zero, the macd line is above the signal
     * line, and the slope aka delta of the macd line is negative -> "sell"
     * 
     * If the signal line is below zero, the macd line is below the signal
     * line, and the slope aka delta of the macd line is positive -> "buy"
     * 
     * Else -> "hold"
     */
    var m = macdLine[macdLine.length - 1];
    var s = macdLine[signalLine.length - 1];
    var deltaS = s - macdLine[signalLine.length - 2];
    
    if (s > 0 && m > s && deltaS < 0) {
        advice = "sell";
    } else if (s < 0 && m < s && deltaS > 0) {
        advice = "buy";
    } else {
        advice = "hold";
    }

    return advice;
};

Durin.prototype.MACD = function(candleHistory, currentCandle, short, long) {
    return 0;
};

Durin.prototype.EMA = function(candleHistory, currentCandle, length) {
    return 0;
};

//Expose the constructor
module.exports = Durin;