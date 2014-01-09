// This trader just assumes that we were able to buy or sell at the last
// transaction price +/- an inefficiency factor
var EventEmitter = require("events").EventEmitter;
var config = require("../config");
var winston = require("winston");


// Constructor, we call EventEmitter's constructor because we subclass it
var DummyTrader = function() {
    this.tradePercentages = config.dummyTrader.tradePercentages;
    this.reservePercentage = config.dummyTrader.assetReservePercentage;
    this.fee = config.dummyTrader.fee;
    this.inefficiency = config.dummyTrader.inefficiency;
    this.lastTrade = {};
    EventEmitter.call(this);
};

//Inherit EventEmitter's prototype
DummyTrader.prototype.__proto__ = EventEmitter.prototype;

DummyTrader.prototype.placeOrder = function(action, timeLen, transactions, wallet) {

    // winston.info([action, wallet.money, wallet.assets]);
    var price = 0;
    switch (action) {
    case "buy":
        var cash = wallet.money * this.tradePercentages[timeLen];
        price = (1 + this.inefficiency)
            * transactions[transactions.length - 1].price;
        if (cash > 1
            && (!this.lastTrade[timeLen] || (this.lastTrade[timeLen][0] == "sell" && this.lastTrade[timeLen][1] > price
                * (1 + this.fee)))) {
            wallet.money -= cash;
            wallet.assets += cash / (price * (1 + this.fee));
            this.lastTrade[timeLen] = [ "buy", price * (1 + this.fee) ];
            console.log([ transactions[transactions.length - 1].time, action, price ]);
        }
        break;
    case "sell":
        price = (1 - this.inefficiency)
            * transactions[transactions.length - 1].price;
        var coins = wallet.assets * (1 - this.reservePercentage)
            * this.tradePercentages[timeLen];
        if (coins > 0.01 && (!this.lastTrade[timeLen] || (this.lastTrade[timeLen][0] == "buy"
            && this.lastTrade[timeLen][1] < price * (1 - this.fee)))) {
            wallet.money += coins * (1 - this.fee) * price;
            wallet.assets -= coins;
            this.lastTrade[timeLen] = [ "sell", price * (1 - this.fee) ];
            console.log([ transactions[transactions.length - 1].time, action, price ]);
        }
        break;
    case "hold":
        break;
    }
    // TODO this logging should probably go to winston
    if (action != "hold") {
//        console.log([ transactions[transactions.length - 1].time, action, price ]);
        console.log([wallet.money, wallet.assets]);
    }
};

//Expose the constructor
module.exports = DummyTrader;
