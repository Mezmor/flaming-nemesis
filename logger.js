// logger.js
// Responsible for writing to console and log file.
// TODO: Implement verbosity levels (log only errors, etc.)
var _ = require("lodash");
var moment = require("moment");
var config = require("./config.js");
var fs = require("fs");

// Constructor
var Logger = function() {
    _.bindAll(this);
};

// Define our methods
Logger.prototype = {
    _write: function(type, args) {
    	var slicedArgs = Array.prototype.slice.call(args);

        var message = moment().format('YYYY-MM-DD HH:mm:ss');
        message += ' (' + type.toUpperCase() + '):\t';
        message += slicedArgs.join(" ");
        message += '\n';

        console.log(message);
        if(config.outfile){
        	fs.appendFile(config.outfile, message, function(err) {
        		if (err) throw err;
        	});
        }
    },
    error: function() {
        this._write('error', arguments);
    },
    warn: function() {
        this._write('warn', arguments);
    },
    info: function() {
        this._write('info', arguments);
    }
};

// Instantiate and expose
module.exports = new Logger();