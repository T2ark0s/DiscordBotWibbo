var fs = require("fs");
var path = require('path');

module.exports = class TimeStaff {

    constructor(Bot) {
        this.bot = Bot;
        this.InLoop = false;

        this.DayReset = 0;
        if (new Date().getHours() == 23)
            this.DayReset = new Date().getDay();

        this.users = {};
        this.loadUsers();

        if (Object.keys(this.users).length == 0) {
            try {
                this.bot.pool.query('SELECT users.username, users.id, cms_page_staff.rank, user_stats.OnlineTime FROM cms_page_staff INNER JOIN users ON(cms_page_staff.userid = users.id) INNER JOIN user_stats ON(cms_page_staff.userid = user_stats.id)', this.updateConnexionLog.bind(this));
            } catch (err) {
                console.log(err);
            }
        }

        setInterval(this.mainLoop.bind(this), 2 * 1000);
    }

    loadUsers() {
        this.users = JSON.parse(fs.readFileSync(path.join(__dirname, "../users.json")));
    }

    mainLoop() {
        if(this.InLoop)
            return;
        
        try {
            if (this.DayReset != new Date().getDay() && new Date().getHours() == 23) {
                this.DayReset = new Date().getDay();

				this.InLoop = true;
                this.bot.pool.query('SELECT users.username, users.id, cms_page_staff.rank, user_stats.OnlineTime FROM cms_page_staff INNER JOIN users ON(cms_page_staff.userid = users.id) INNER JOIN user_stats ON(cms_page_staff.userid = user_stats.id)', this.updateConnexionLog.bind(this));
            }
        } catch (err) {
            console.log(err);
        }
    }

    updateConnexionLog(err, rows) {
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
        var messageTwo = "";
        var messageThree = "";
        var messagerank = [];

        var Users = JSON.parse(JSON.stringify(this.users));
        this.users = {};

        for (var i = 0; i < rows.length; i++) {
            row = rows[i];
            if (!Users.hasOwnProperty(row.id)) {
                this.users[row.id] = {
                    "onlinetime": row.OnlineTime,
                    "dayInatif": 0
                };
                continue;
            }

            if (!messagerank.hasOwnProperty(row.rank))
                messagerank[row.rank] = "";

            var TotalTime = row.OnlineTime - Users[row.id].onlinetime;

            if (TotalTime > 0) {
                Users[row.id].dayInatif = 0;
                var UserDate = this.getHMS(TotalTime);

                messagerank[row.rank] += "**" + row.username + "**: `" + UserDate.Hours + " Heures " + UserDate.Minutes + " Minutes et " + UserDate.Seconds + " Seconds (Total: " + TotalTime + " Seconds)`\n";
            } else {
                Users[row.id].dayInatif++;
                messagerank[row.rank] += "**" + row.username + "**: `Inatif depuis " + Users[row.id].dayInatif + " jours`\n";
            }
            this.users[row.id] = {
                "onlinetime": row.OnlineTime,
                "dayInatif": Users[row.id].dayInatif
            };
        }

        fs.writeFileSync(path.join(__dirname, '../users.json'), JSON.stringify(this.users));

        if (messagerank.hasOwnProperty(13)) {
            messageTwo += "__**Gérants**__\n";
            messageTwo += messagerank[13];
            messageTwo += "\n";
        }
        if (messagerank.hasOwnProperty(5)) {
            messageTwo += "__**Administrateurs**__\n";
            messageTwo += messagerank[5];
            messageTwo += "\n";
        }
        if (messagerank.hasOwnProperty(9)) {
            messageTwo += "__**Animateurs**__\n";
            messageTwo += messagerank[9];
            messageTwo += "\n";
        }
        if (messagerank.hasOwnProperty(6)) {
            message += "__**Modérateurs**__\n";
            message += messagerank[6];
            message += "\n";
        }
        if (messagerank.hasOwnProperty(14)) {
            messageThree += "__**Graphistes**__\n";
            messageThree += messagerank[14];
            messageThree += "\n";
        }
        if (messagerank.hasOwnProperty(3)) {
            message += "__**Helpeurs**__\n";
            message += messagerank[3];
            message += "\n";
        }
        if (messagerank.hasOwnProperty(4)) {
            messageThree += "__**Architectes**__\n";
            messageThree += messagerank[4];
            messageThree += "\n";
        }
        if (messagerank.hasOwnProperty(1)) {
            message += "__**Croupiers**__\n";
            message += messagerank[1];
        }

        if (messageTwo != "")
            this.bot.sendMessage(messageTwo, 'logs_connexion');
        if (messageThree != "")
            this.bot.sendMessage(messageThree, 'logs_connexion');
        if (message != "")
            this.bot.sendMessage(message, 'logs_connexion');

        this.InLoop = false;
    }

    getHMS(totalSeconds) {
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;

        return {
            Hours: hours,
            Minutes: minutes,
            Seconds: seconds
        };
    }

    getTime(unix_timestamp) {
        var date = new Date(unix_timestamp * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }
}