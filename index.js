var Bot = require('./Bot');
var Commands = require('./modules/CommandList');

console.log("[Bot] Wibbo");


var bot = new Bot();
bot.start();

var readline = require('readline');
var in_ = readline.createInterface({ input: process.stdin, output: process.stdout });
setTimeout(prompt, 100);

function prompt() {
    in_.question(">", function (str) {
        parseCommands(str);
        return prompt();
    });
};

function parseCommands(str) {
    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Get command function
    var execute = Commands.list[first];
    if (typeof execute != 'undefined') {
        execute(bot, split);
    } else {
        console.log("[Console] Invalid Command!");
    }
}

process.on('SIGINT', function () {
    process.exit(0);
});