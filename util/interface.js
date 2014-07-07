// interface.js
//
// Command line interface for nemesis
// Prompts user interactively for commands and does them, supplying output
//
var nopt = require("nopt");
var readJson = require("read-package-json");
var prompt = require("prompt");
var charm = require("charm")();
var sprintf = require("sprintf-js").sprintf;
var Demon = require("../demon"); 

// interactive interface
function Iface() {
    // list of known commands
    this.commandList = {
        "bt" : {
            "commandFunc" : backtest,
            "commandDesc" : "backtest",
            "commandOpts" : null,
            "commandShort": null
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
    
    // setup interface
    charm.pipe(process.stdout);
    prompt.message = "";
    prompt.delimiter = "";
    prompt.start();
    
    // go
    readCommand();
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

function help(cb) {
    console.log("Available commands:");
    for (var c in this.commandList) {
        console.log(sprintf("  %-10s\t%s", c, this.commandList[c].commandDesc));
    }
    cb();
}

function backtest(cb) {
    console.log("backtest");
    demon = new Demon("bt");
    cb();
}

function readCommand() {
    console.log("");
    prompt.get([{properties : {command : {description : ">".green}}}],
        function(err, result) {
            if (err) {
                console.log("input error!");
                return;
            } else {
                if (this.commandList[result.command]) {
                    this.commandList[result.command].commandFunc.bind(this)(readCommand);
                } else {
                    if (result.command) {
                        console.log("unknown command " + result.command);
                        help(readCommand);
                    } else {
                        readCommand();
                    }
                }
            }
        });
}

module.exports = Iface;
