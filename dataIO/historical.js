// historical.js
// Driver responsible for reading historical transaction data and building variable length candles
var EventEmitter = require("events").EventEmitter;
var fs = require("fs");


// Constructor, we call EventEmitter's constructor because we subclass it
var Historical = function(datafile){
	this.data = datafile;
	EventEmitter.call(this);
};

// Inherit EventEmitter's prototype
Historical.prototype.__proto__ = EventEmitter.prototype;

Historical.prototype.start = function(){
	// Begin reading data
	this.emit("start"); // Test emit
	this.read();
};

// Assumes the data to be structured as: (time, price, volume)
Historical.prototype.read = function(){
	var array = fs.readFileSync(this.data).toString().split('\n');
	// Candles are: (1m [60s], 15m [900s], 1h [3600s], 4h [14400s], 24h [86400s])
	// Candle: start, open, low, high, close
	candles = {
			"1m": {},
			"15m": {},
			"1h": {},
			"4h": {},
			"24h": {}
	};
	for(var i = 0; i < array.length ; i++){
		var line = array[i].split(",");
		var currentTransaction = { "time": line[0], "price": line[1], "volume": line[2] };
		var previousTransaction; // Initialized at the end of the loop
		
		// Update each candle
		for(var candleType in candles){
			var candle = candles[candleType];
			if(!candle.start){ 
				// This is a new candle!
				initData(candle, currentTransaction);
			} else {
				// If we complete a candle, we emit the current candle.
				// We don't add the currentTransaction to the current candle
				// Otherwise we add the current transaction data to the candle
				var timeDelta = currentTransaction.time - candle.start;
				console.log(candleType + ": " + timeDelta);
				if((timeDelta > 86400) & (candleType === "24h")){
					candle.close = previousTransaction.price; // Close is the last transaction's price
					this.emit("candle-24h", candle);
					candles[candleType] = {};
					initData(candle, currentTransaction);
				} else if((timeDelta > 14400) & (candleType === "4h")){
					candle.close = previousTransaction.price; // Close is the last transaction's price
					this.emit("candle-4h", candle);
					candles[candleType] = {};
					initData(candle, currentTransaction);
				} else if((timeDelta > 3600) & (candleType === "1h")) {
					candle.close = previousTransaction.price; // Close is the last transaction's price
					this.emit("candle-1h", candle);
					candles[candleType] = {};
					initData(candle, currentTransaction);
				} else if((timeDelta > 900) & (candleType === "15m")) {
					candle.close = previousTransaction.price; // Close is the last transaction's price
					this.emit("candle-15m", candle);
					candles[candleType] = {};
					initData(candle, currentTransaction);
				} else if((timeDelta > 60) & (candleType === "1m")) {
					candle.close = previousTransaction.price; // Close is the last transaction's price
					this.emit("candle-1m", candle);
					candles[candleType] = {};
					initData(candle, currentTransaction);
				} else {
					// Add transaction data to candle
					if(currentTransaction.price > candle.high){ 
						// This is a new high
						candle.high = currentTransaction.price;
					} else if(currentTransaction.price < candle.low){ 
						// This is a new low
						candle.low = currentTransaction.price;
					}
				}
			}
		}
		previousTransaction = currentTransaction;
	}
	this.emit("done");
};

// Initialize a candle with the currentTransaction
function initData(candle, currentTransaction){
	candle.start = currentTransaction.time;
	candle.open = currentTransaction.price;
	candle.high = candle.low = currentTransaction.price;
};

// Set Historical's prototype functions:
// pull historical data from bitcoincharts
// convert trade data into candlestick data at different ranges
// emit the "candle-found" event, listeners will act appropriately 

//Expose the constructor
module.exports = Historical;