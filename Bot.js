var Discord = require('discord.js');
var Mysql = require('mysql');
var fs = require("fs");
var ini = require('./modules/ini');
var path = require('path');

var CmdLogs = require('./Check/CmdLogs');
var ChatlogsPub = require('./Check/ChatlogsPub');
var BoutiqueLogs = require('./Check/BoutiqueLogs');
var StaffLog = require('./Check/StaffLog');
var TimeStaff = require('./Check/TimeStaff');
var NetWork = require('./NetWork');

module.exports = class Bot {

	constructor() {
		this.client = new Discord.Client();
		this.newMember = [];

		this.NetWork = null;

		this.CmdLogs = null;
		this.ChatlogsPub = null;
		this.BoutiqueLogs = null;
		this.StaffLog = null;
		this.TimeStaff = null;

		//Config
		this.config = {
			//Mysql Config
			host: '127.0.0.1',
			user: 'root',
			password: '',
			database: 'trypoling',
			port: '3306',

			//Other
			botToken: '',
		}

		// Parse config
		this.loadConfig();

		//Mysql Pool
		this.pool = Mysql.createPool({
			connectionLimit: 2, //important
			host: this.config.host,
			user: this.config.user,
			password: this.config.password,
			database: this.config.database,
			port: this.config.port,
			debug: false
		});
	}

	loadConfig() {
		try {
			// Load the contents of the config file
			var load = ini.parse(fs.readFileSync(path.join(__dirname, './config.ini'), 'utf-8'));

			// Replace all the default config's values with the loaded config's values
			for (var obj in load) {
				this.config[obj] = load[obj];
			}
		} catch (err) {
			// No config
			console.log("[Bot] Config not found... Generating new config");

			// Create a new config
			fs.writeFileSync(path.join(__dirname, './config.ini'), ini.stringify(this.config));
		}
	};

	start() {
		this.client.login(this.config.botToken);
		this.client.on('ready', this.botReady.bind(this))
		this.client.on('message', this.botMessage.bind(this));
		this.client.on('guildMemberAdd', this.botMemberAdd.bind(this));
		this.client.on('guildMemberRemove', this.botMemberRemove.bind(this));
	}

	GenerateToken() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 10; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

	botMemberAdd(member) {
		const guild = member.guild;
		if (!this.newMember[guild.id]) this.newMember[guild.id] = new Discord.Collection();

		if (this.newMember[guild.id].has(member.id))
			return;
		this.newMember[guild.id].set(member.id, this.GenerateToken());

		var Token = this.newMember[guild.id].get(member.id);

		member.send("Bienvenue sur le serveur Discord de Wibbo " + member.user.username + " !\n" +
			"Confirmer votre compte Wibbo sur https://wibbo.org/discord/" + guild.id + "/" + member.user.id + "/" + Token + " !");
	}

	botMemberRemove(member) {
		const guild = member.guild;
		if (!this.newMember[guild.id])
			return;
		if (this.newMember[guild.id].has(member.id)) this.newMember[guild.id].delete(member.id);
	}

	botMessage(msg) {
		const guild = msg.guild;
		if(guild == null)
			return;

		var role = guild.roles.find("name", "Test");
		if (role == null)
			return;
		if (msg.member.roles.has(role.id))
			return;

		if (msg.content != "!confirme")
			return;

		if (!this.newMember[guild.id]) this.newMember[guild.id] = new Discord.Collection();

		if (this.newMember[guild.id].has(msg.member.id))
			return;
		this.newMember[guild.id].set(msg.member.id, this.GenerateToken());

		var Token = this.newMember[guild.id].get(msg.member.id);

		msg.member.send("Confirmer votre compte Wibbo sur https://wibbo.org/discord/" + guild.id + "/" + msg.member.user.id + "/" + Token + " !");

		/*if (msg.members.roles.some(r => ["Gérants", "Administrateurs"].includes(r.name))) {
			if (msg.content === 'ping') {
				var embed = new Discord.RichEmbed()
				.setTitle("Wibbo")
				.setURL("https://wibbo.org")
				.setDescription("Jason a pris une photo !")
				.setAuthor("Jason")
				.setImage("https://cdn.wibbo.me/photos/babc108290246e1ee4451f33a7b027cb.png");
				msg.channel.send(embed);
				//this.sendMessage("Test", '👑administrateur👑');
			}
		}*/
	}

	botReady() {
		this.NetWork = new NetWork(this);

		this.CmdLogs = new CmdLogs(this);
		this.ChatlogsPub = new ChatlogsPub(this);
		this.BoutiqueLogs = new BoutiqueLogs(this);
		this.StaffLog = new StaffLog(this);
		this.TimeStaff = new TimeStaff(this);
	}

	sendMessage(Message, SalonName) {
		var channel = this.client.channels.find('name', SalonName);
		if (channel == null) {
			console.log("Channel introuvable: " + SalonName);
			return;
		}
		channel.send(Message)
			.catch(console.error);
	}
}