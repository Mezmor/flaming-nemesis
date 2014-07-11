// nemesis.js
// The main handler for all things Balrog
var winston = require("winston");
var Iface = require("./util/iface");

// initialize nemesis
function Init() {
    //
    // Set up Winston for Logging
    //
    // Add file transport to winston, console is set by default
    // Current settings: log everything to console + file
    // winston.add(winston.transports.File, { filename: config.outfile });
    winston.remove(winston.transports.Console);
}

cwd = __dirname;
Init();
Iface();
