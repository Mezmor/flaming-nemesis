// Gandalf ain't got shit on me.

var EventEmitter = require("events").EventEmitter;
var config = require("../config");
var winston = require("winston");
var Math = require("../util/math");

//Constructor, we call EventEmitter's constructor because we subclass it
var Durin = function() {
    math = new Math();
    EventEmitter.call(this);
};

// Inherit EventEmitter's prototype
Durin.prototype.__proto__ = EventEmitter.prototype;

Durin.prototype.advise = function(candleHistories, timeLen) {
    // based on current and historical candles, output a "buy" "sell" or "hold"
    // order for each time period: 1m, 15m, 1h, 4h, 24h
    //
    // these are emitted as events that the trader will react to.
    // the trader will cancel any previous orders not filled, and place a new
    // order.
    var advice;
    var candleHistory = candleHistories[timeLen];

    var macdLine = math.MACD(candleHistory, 12, 26);
    var signalLine= math.EMA(macdLine, 9);
    
    /* If the signal line is above zero, the macd line is above the signal
     * line, and the slope aka delta of the macd line is negative -> "sell"
     * 
     * If the signal line is below zero, the macd line is below the signal
     * line, and the slope aka delta of the macd line is positive -> "buy"
     * 
     * Else -> "hold"
     */
    var m = macdLine[macdLine.length - 1];
    var m2 = macdLine[macdLine.length - 2];
    var m3 = macdLine[macdLine.length - 3];
    var s = signalLine[signalLine.length - 1];
    var deltaM = m - m2;
    var deltaM2 = m2 - m3;
    var price = candleHistory[candleHistory.length - 1].close;
    var margin = 1.0;
    if (s / price > 0.01 && m2 > s * margin && deltaM2 >= 0 && deltaM < 0) {
//        console.log([timeLen, m, s, deltaM]);
        advice = "sell";
    } else if (s / price < -0.01 && m2 < s * margin && deltaM2 <= 0 && deltaM > 0) {
//        console.log([timeLen, m, s, deltaM]);
        advice = "buy";
    } else {
        advice = "hold";
    }

    return advice;
};


//Expose the constructor
module.exports = Durin;
