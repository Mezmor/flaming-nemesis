var _ = require("lodash");
var moment = require("moment");

var Logger = function() {
    _.bindAll(this);
};

Logger.prototype = {
    _write: function(type, args) {
    	var args = Array.prototype.slice.call(args);

        var message = moment().format('YYYY-MM-DD HH:mm:ss');
        message += ' (' + type.toUpperCase() + '):\t';
        message += args.join(" ");

        console.log(message);
        if(config.outFile){
        	
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

module.exports = new Logger;