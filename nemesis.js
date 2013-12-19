// nemesis.js
// The main handler for all things Balrog
var config = require("./config");
var winston = require("winston");
var Historical = require("./dataIO/historical");

// Init logger
// Init data-parser
// Init advisor
// Init trader

// Add file transport to winston, console is set by default
// Current settings: log everything to console + file
winston.add(winston.transports.File, { filename: config.outfile });

// Instantiate the appropriate dataIO driver
var dataIO; 
if(config.mode.data === "historical"){
	dataIO = new Historical(config.outfile);
	console.log("Created new historical");
} else {
	// Instantiate the live driver
	console.log("Created new realtime");
}


dataIO.on("start", function(){
	console.log("event caught");
});

dataIO.start();