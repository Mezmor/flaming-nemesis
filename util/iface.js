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
var keypress = require('keypress');

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
    this.consoleM = [];
    this.commandM = '';
    
    // setup interface
    charm.pipe(process.stdout);
    charm.reset();
    prompt.message = "";
    prompt.delimiter = "";
    prompt.start();
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding( 'utf8' );
    process.stdin.resume();

    // on any data into stdin
    process.stdin.on('keypress', function (ch, key) {
        if (key && key.name.length == 1) {
            commandM += key.name;
            drawScreen();
        }
        if (key && key.ctrl && key.name == 'c') {
            charm.reset();
            process.stdin.pause();
        }
        if (key && key.name == 'return') {
            print('console', '> ' + commandM);
            readCommand(commandM);
            commandM = '';
            drawScreen();
        }
        if (key && key.name == 'backspace') {
            commandM = commandM.slice(0, -1);
            drawScreen();
        }
    });
    
    // go
    drawScreen.apply(this);
}

function print(type, m) {
    switch (type) {
    default:
    case 'console':
        // console messages tab
        m.split('\n').forEach(function(l) {this.consoleM.push(l);});
        while (this.consoleM.length > process.stdout.rows - 5) {
            this.consoleM.shift();
        }
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
    charm.reset();
    // draw status area
    charm.position(0,0);
    charm.background('yellow');
    charm.foreground('black');
    charm.write("status\n");
    charm.write("status\n");
    charm.write("status\n");
    
    // draw tab
    charm.position(0, process.stdout.rows - consoleM.length);
    charm.background('black');
    charm.foreground('white');
    
    this.consoleM.forEach(function(l) { charm.write(l + '\n');});
    
    // draw command area
    charm.foreground('green');
    charm.position(0, process.stdout.rows);
    charm.write('> ');
    charm.foreground('white');
    charm.write(commandM);
}

// read and execute user command
function readCommand(command) {
    var cl = command.split(' ');
    var cmd = cl[0];
    if (this.commandList[cmd]) {
        var parsedOpts = nopt(this.commandList[cmd].commandOpts,this.commandList[cmd].commandShort,cl,1);
        this.commandList[cmd].commandFunc.call(this, parsedOpts, function() {});
    } else {
        if (command) {
            this.print('console', "unknown command " + cmd);
            help({}, function() {});
        } else {
            drawScreen();
        }
    }
}


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
    var out = '';
    out += 'Available commands:';
    for (var c in this.commandList) {
        out += sprintf("\n  %-10s\t%s", c, this.commandList[c].commandDesc);
    }
    this.print('console', out);
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
