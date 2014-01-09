// Math helper functions
var EventEmitter = require("events").EventEmitter;
var config = require("../config");
var winston = require("winston");

// Constructor, we call EventEmitter's constructor because we subclass it
var Math = function() {
    EventEmitter.call(this);
};

//Inherit EventEmitter's prototype
Math.prototype.__proto__ = EventEmitter.prototype;

Math.prototype.MACD = function(candleHistory, short, long) {
    var closes = this.getClosePrices(candleHistory);
    var emaShort = this.EMA(closes, short);
    var emaLong = this.EMA(closes, long);
    var macd = [];
    
    for (var i = 0; i < candleHistory.length; i++) {
        macd[i] = emaShort[i] - emaLong[i];
    }
    
    return macd;
};

Math.prototype.EMA = function(values, length) {
    var ema = [];
    var multiplier = (2 / (length + 1));

    for (var i = 0; i < values.length; i++) {
        if (i == 0) {
            ema[i] = values[i];
        } else {
            ema[i] = (values[i] - ema[i-1]) * multiplier + ema[i-1];
        }
    }

    return ema;
};

Math.prototype.getClosePrices = function(candleHistory) {
    var values = [];
    for (var i = 0; i < candleHistory.length; i++) {
        values[i] = candleHistory[i].close;
    }
    return values;
};

//Expose the constructor
module.exports = Math;
