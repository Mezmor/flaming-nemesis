// This trader just assumes that we were able to buy or sell at the last
// transaction price +/- an inefficiency factor
//var EventEmitter = require("events").EventEmitter;
var winston = require("winston");


// Constructor, we call EventEmitter's constructor because we subclass it
var DummyTrader = function(config) {
    this.tradePercentages = config.dummyTrader.tradePercentages;
    this.reservePercentage = config.dummyTrader.assetReservePercentage;
    this.fee = config.dummyTrader.fee;
    this.inefficiency = config.dummyTrader.inefficiency;
    this.lastTrade = {};
    this.positions = {
        "1m" : [],
        "15m" : [],
        "1h" : [],
        "4h" : [],
        "24h" : []
    };
    this.maxPositions = 10;
    this.cashMin = 1;
    this.coinMin = 0.01;
    this.heldMoney = 0;
    this.heldAssets = 0;
//    EventEmitter.call(this);
};

//Inherit EventEmitter's prototype
//DummyTrader.prototype.__proto__ = EventEmitter.prototype;

DummyTrader.prototype.placeOrder = function(action, timeLen, transactions, wallet) {
    
    var position = {
        "type" : {},
        "time" : {},
        "price": {},
        "volume": {}
    };

    // winston.info([action, wallet.money, wallet.assets]);
    switch (action) {
    case "buy":
        // calculate how much $ we want to spend on the buy
        var coins;
        var cash = (wallet.money - this.heldMoney) * this.tradePercentages[timeLen];
        if (cash > this.cashMin) { // make sure this trade meets the minimum
            var price = (1 + this.inefficiency) * (1 + this.fee)
                * transactions[transactions.length - 1].price;
            coins = cash / price;
            
            this.closeProfitPositions(price, wallet, timeLen);
            
            // TODO engage all stop-losses
            // open a new position
            if (this.positions[timeLen].length < this.maxPositions) {
                // make trade
                wallet.money -= cash;
                wallet.assets += coins;
                this.heldAssets += coins;
                
                // record position
                position.type = "long";
                position.time = transactions[transactions.length - 1].time;
                position.price = price;
                position.volume = coins;
                this.positions[timeLen].push(position);
                
                console.log([ transactions[transactions.length - 1].time, action, cash, coins]);
                console.log([wallet.money, wallet.assets]);
            }
        }

        break;
    case "sell":
        // calculate how many coins we want to sell
        var coins = (wallet.assets - this.heldAssets) * (1 - this.reservePercentage)
            * this.tradePercentages[timeLen];
        var cash;
        if (coins > this.coinMin) {
            var price = (1 - this.inefficiency) * (1 - this.fee)
                * transactions[transactions.length - 1].price;
            cash = coins * price;

            this.closeProfitPositions(price, wallet, timeLen);
            
            // TODO engage all stop-losses
            // open a new position
            if (this.positions[timeLen].length < this.maxPositions) {
                // make trade
                wallet.money += cash;
                wallet.assets -= coins;
                this.heldMoney += cash;

                //record position
                position.type = "short";
                position.time = transactions[transactions.length - 1].time;
                position.price = price;
                position.volume = coins;
                this.positions[timeLen].push(position);
                
                console.log([ transactions[transactions.length - 1].time, action, cash, coins]);
                console.log([wallet.money, wallet.assets]);
            }
        }
        break;
    case "hold":
        break;
    }
    // TODO this logging should probably go to winston
//    if (action != "hold") {
//        console.log([wallet.money, wallet.assets]);
//        console.log([this.heldMoney, this.heldAssets]);
//        console.log(this.positions);
//    }
};

// Close all profitable positions
DummyTrader.prototype.closeProfitPositions = function(price, wallet, timeLen) {
    for (var i = 0; i < this.positions[timeLen].length; i++) {
        p = this.positions[timeLen][i];
        if (p.type == "long" && price > p.price) {
            // close profitable long position (sell)
            var coins = p.volume;
            var cash = coins * price;

            wallet.money += cash;
            wallet.assets -= coins;
            this.heldAssets -= coins;

            var idx = this.positions[timeLen].indexOf(p);
            this.positions[timeLen].splice(idx, 1);
            i--;
        } else if (p.type == "short" && price < p.price) {
            // close profitable short position (buy)
            var cash = p.volume * p.price;
            var coins = cash / price;

            wallet.money -= cash;
            wallet.assets += coins;
            this.heldMoney -= cash;

            var idx = this.positions[timeLen].indexOf(p);
            this.positions[timeLen].splice(idx, 1);
            i--;
        }
    }
};

//Expose the constructor
module.exports = DummyTrader;
