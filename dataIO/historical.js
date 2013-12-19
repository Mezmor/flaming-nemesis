// historical.js
// Driver responsible for reading historical transaction data and building variable length candles
var EventEmitter = require('events').EventEmitter;


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
};

// Set Historical's prototype functions:
// pull historical data from bitcoincharts
// convert trade data into candlestick data at different ranges
// emit the "candle-found" event, listeners will act appropriately 

//Expose the constructor
module.exports = Historical;