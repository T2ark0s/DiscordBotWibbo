
// Imports
var Bot = require('../Bot');

class Commands {
    constructor() {
        this.list = {}; // Empty
    }
}

module.exports = Commands;

// Utils
var fillChar = function (data, char, fieldLength, rTL) {
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    }
    else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};

// Commands

Commands.list = {
    hello: function (Bot, split) {
        console.log("Hi !");
    },
    clear: function (Bot, split) {
        process.stdout.write('\033c');
    },
    close: function (Bot, split) {
        process.exit();
    },
    send: function (Bot, split) {

    }
};