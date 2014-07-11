// iface.js
//
// Command line interface for nemesis
// Prompts user interactively for commands and does them, supplying output
//
var nopt = require("nopt");
var readJson = require("read-package-json");
var prompt = require("prompt");
var charm = require("charm")();
var sprintf = require("sprintf-js").sprintf;
var Config = require("../config");
var Demon = require("../demon");

// interactive interface
function Iface() {
    // list of known commands
    this.commandList = {
        "bt" : {
            "commandFunc" : backtest,
            "commandDesc" : "backtest",
            "commandOpts" : {
                                "pull-new"      : Boolean,
                                "start-date"    : [String, null],
                                "exchange"      : [String, null]
                            },
            "commandShort": {
                                "n" : ["--pull-new"],
                                "s" : ["--start-date"],
                                "e" : ["--exchange"]
                            }
        },
        "exit" : {
            "commandFunc" : quit,
            "commandDesc" : "exit",
            "commandOpts" : null,
            "commandShort": null
        },
        "help" : {
            "commandFunc" : help,
            "commandDesc" : "print this help",
            "commandOpts" : null,
            "commandShort": null
        },
        "quit" : {
            "commandFunc" : quit,
            "commandDesc" : "exit",
            "commandOpts" : null,
            "commandShort": "q"
        },
        "version" : {
            "commandFunc" : version,
            "commandDesc" : "print version",
            "commandOpts" : null,
            "commandShort": null
        },
    };
    
    this.print = print.bind(this);
    this.consoleM = ["1", "2", "3"];
    
    // setup interface
    charm.pipe(process.stdout);
    charm.reset();
    prompt.message = "";
    prompt.delimiter = "";
    prompt.start();
    
    // go
    drawScreen.apply(this);
    readCommand();
}

function print(m, type) {
    switch (type) {
    case 'console':
        // console messages tab
        this.consoleM.push(m);
        break;
            
    case 'trade':
        // our trades
        break;
        
    case 'market':
        // market's trades
        break;
        
    case 'bkgd':
        // background tasks
    }
};

// redraw the screen
function drawScreen() {
    // draw status area
    charm.position(0,0);
    charm.background('yellow');
    charm.foreground('black');
    charm.write("status\n");
    charm.write("status\n");
    charm.write("status\n");
    // draw tab
    charm.position(0, 5);
    charm.background('black');
    charm.foreground('white');
    this.consoleM.forEach(function(l) { charm.write(l + '\n');});
    
    // draw command area
    charm.position(0, process.stdout.rows);
}

// read and execute user command
function readCommand() {
    prompt.get([{properties : {command : {description : ">".green}}}],
        function(err, result) {
            if (err) {
                console.log("input error!");
                return;
            } else {
                var cl = result.command.split(' ');
                var cmd = cl[0];
                if (this.commandList[cmd]) {
                    var parsedOpts = nopt(this.commandList[cmd].commandOpts,this.commandList[cmd].commandShort,cl,1);
                    this.commandList[cmd].commandFunc.call(this, parsedOpts, readCommand);
                } else {
                    if (result.command) {
                        console.log("unknown command " + cmd);
                        help({}, readCommand);
                    } else {
                        readCommand();
                    }
                }
            }
        });
};

// Print version
function version(cb) {
    readJson('package.json', console.error, false, function(er, data) {
        if (er) {
            console.log("package.json not found");
        } else {
            console.log(data.name + " version " + data.version);
        }
        cb();
    });
}

function quit() {
    process.exit();
}

function help(opts, cb) {
    console.log("Available commands:");
    for (var c in this.commandList) {
        console.log(sprintf("  %-10s\t%s", c, this.commandList[c].commandDesc));
    }
    cb();
}

function backtest(opts, cb) {
    console.log("backtest");
    
    // pull default opts
    var config = new Config();
    
    // replace opts
    var pn = opts["pull-new"];
    if (pn) {
        config.backtestSettings.pullNew = pn;
    }
    var sd = opts["start-date"];
    if (sd) {
        config.backtestSettings.startDate = sd;
    }
    var e = opts["exchange"];
    if (e) {
        config.backtestSettings.exchange = e;
    }
    
    demon = new Demon("bt", config, this);
    cb();
}

module.exports = Iface;
