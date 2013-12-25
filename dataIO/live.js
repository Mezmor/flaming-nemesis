// live.js
// Driver responsible for reading in realtime transaction data and building variable length candles
var EventEmitter = require('events').EventEmitter;


// Constructor, we call EventEmitter's constructor because we subclass it
var Live = function(datafile){
	this.data = datafile;
	EventEmitter.call(this);
	
	this.start = function(){
		// Begin reading data
		this.emit("start"); // Test emit
		console.log("emitted");
	};
};

// Inherit EventEmitter's prototype
Live.prototype.__proto__ = EventEmitter.prototype;

// Set Live prototype functions:
// pull live data from (bitcoincharts?)
// convert trade data into candlestick data at different ranges
// emit the "candle-found" event, listeners will act appropriately 

//Expose the constructor
module.exports = Live;
