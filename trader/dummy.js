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
    EventEmitter.call(this);
};

//Inherit EventEmitter's prototype
DummyTrader.prototype.__proto__ = EventEmitter.prototype;

DummyTrader.prototype.placeOrder = function(action, timeLen, transactions, wallet) {
    // TODO this logging should probably go to winston
    console.log([action, wallet.money, wallet.assets]);
    switch (action) {
    case "buy":
        var cash = wallet.money * this.tradePercentages[timeLen];
        var price = (1 + this.inefficiency) * transactions[transactions.length - 1].price;
        wallet.money -= cash;
        wallet.assets += cash / (price * (1 + this.fee));
        break;
    case "sell":
        var price = (1 - this.inefficiency) * transactions[transactions.length - 1].price;
        var coins = wallet.assets * (1 - this.reservePercentage) * this.tradePercentages[timeLen];
        wallet.money += coins * (1 - this.fee) * price;
        wallet.assets -= coins;
        break;
    case "hold":
        break;
    }
};

//Expose the constructor
module.exports = DummyTrader;
