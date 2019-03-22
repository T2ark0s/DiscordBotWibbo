module.exports = class CmdLogs {

    constructor(Bot) {
        this.bot = Bot;
        this.lastId = -1;
        this.InLoop = false;

        this.bot.pool.query('SELECT id FROM cmdlogs ORDER BY id DESC LIMIT 1', this.getLastId.bind(this));
        setInterval(this.mainLoop.bind(this), 5000);
    }

    getLastId(err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        if (typeof rows === 'undefined' || rows.length == 0) {
            return;
        }
        var row = rows[0];
        this.lastId = row.id;
    }

    mainLoop() {
        if(this.InLoop)
            return;
        try {
            if (this.lastId == -1) {
                this.bot.pool.query('SELECT id FROM cmdlogs ORDER BY id DESC LIMIT 1', this.getLastId.bind(this));
                return;
            }
			this.InLoop = true;
            this.bot.pool.query('SELECT id, user_name, extra_data, timestamp FROM cmdlogs WHERE id > ? ORDER BY id ASC LIMIT 5', [this.lastId], this.getCmdLogs.bind(this));
        }
        catch (err) { console.log(err); }
    }

    getCmdLogs(err, rows) {
        if (err) {
            console.log(err);
            this.InLoop = false;
            return;
        }
        if (typeof rows === 'undefined' || rows.length == 0) {
            this.InLoop = false;
            return;
        }
        var row;
        var message = "";
        for (var i = 0; i < rows.length; i++) {
            row = rows[i];
            message += "**" + row.user_name + "** à " + this.getTime(row.timestamp) + ": `" + row.extra_data + "`\n";
            this.lastId = row.id;
        }
        this.bot.sendMessage(message, 'logs_commands');
        this.InLoop = false;
    }

    getTime(unix_timestamp) {
        var date = new Date(unix_timestamp * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }
}