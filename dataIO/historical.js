// historical.js
// Driver responsible for reading historical transaction data and building variable length candles
var EventEmitter = require("events").EventEmitter;
var fs = require("fs");


// Constructor, we call EventEmitter's constructor because we subclass it
var Historical = function(datafile){
	this.data = datafile;
	EventEmitter.call(this);
	this.candles1min = [];
	this.candles15min = [];
	this.candles1hour = [];
	this.candles4hour = [];
	this.candles24hour = [];
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
	candle = {}; // start, open, high, low, close
	for(var i = 0; i < array.length ; i++){
		var line = array[i].split(",");
		var currentTransaction = { "time": line[0], "price": line[1], "volume": line[2] };
		var previousTransaction; // Initialized at the end of the loop
		
		if(!candle.start){ 
			// This is a new candle!
			initData(candle, currentTransaction);
			console.log(candle);
		} else {
			// If we complete a candle, we emit the current candle.
			// We don't add the currentTransaction to the current candle
			// Candles are: (1m [60s], 15m [900s], 1h [3600s], 4h [14400s], 24h [86400s])
			// Otherwise we add the current transaction data to the candle
			var timeDelta = currentTransaction.time - candle.start;
			if(timeDelta >= 86400){
				candle.close = previousTransaction.price; // Close is the last transaction's price
				this.emit("candle-24h", candle);
				candle = {};
				initData(candle, currentTransaction);
			} else if(timeDelta >= 14400){
				candle.close = previousTransaction.price; // Close is the last transaction's price
				this.emit("candle-4h", candle);
				candle = {};
				initData(candle, currentTransaction);
			} else if(timeDelta >= 3600) {
				candle.close = previousTransaction.price; // Close is the last transaction's price
				this.emit("candle-1h", candle);
				candle = {};
				initData(candle, currentTransaction);
			} else if(timeDelta >= 900) {
				candle.close = previousTransaction.price; // Close is the last transaction's price
				this.emit("candle-15m", candle);
				candle = {};
				initData(candle, currentTransaction);
			} else if(timeDelta >= 60) {
				candle.close = previousTransaction.price; // Close is the last transaction's price
				this.emit("candle-1m", candle);
				candle = {};
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
		previousTransaction = currentTransaction;
	};
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