const net = require("net");

module.exports = class Network {
  constructor(Bot) {
    this.bot = Bot;
    this.server = net.createServer(this.connect.bind(this)).listen(8914);
  }

  connect(socket) {
    if (socket.remoteAddress != "::ffff:127.0.0.1") {
      console.log("Tentative de connexion au Mus: " + socket.remoteAddress);
      socket.destroy();
      return;
    }
    console.log("Connection d'un client: " + socket.remoteAddress);

    socket.on("data", data => {
      data = data.toString();
      if (!data.includes(this.chr(1))) {
        socket.destroy();
        return;
      }
      
      var cmd = data.split(this.chr(1))[0];
      switch (cmd) {
        case "AddUser":
          var parameters = data.split(this.chr(1));
          if (parameters.length != 5) break;

          var GuildId = parameters[1];
          var UserId = parameters[2];
          var Token = parameters[3];
          var Username = parameters[4];

          if (!this.bot.newMember[GuildId]) break;

          if (!this.bot.newMember[GuildId].has(UserId)) break;

          var UserToken = this.bot.newMember[GuildId].get(UserId);
          if (UserToken != Token) break;

          let guild = this.bot.client.guilds.get(GuildId);
          if (guild == null) break;
          var member = guild.members.get(UserId);
          if (member == null) break;

          var role = guild.roles.find("name", "Test");
          if (role == null) break;
          if (member.roles.has(role.id)) break;

          member.addRole(role);
          member.setNickname(Username);

          member.send(
            "Votre compte Wibbo " + Username + " à bien été confirmer!"
          );

          this.bot.newMember[GuildId].delete(UserId);

          console.log(
            "L'utilisateur " +
              member.user.username +
              " (" +
              Username +
              ") à confirmer son compte!"
          );

          break;
      }
      socket.destroy();
    });
  }

  chr(codePt) {
    if (codePt > 0xffff) {
      codePt -= 0x10000;
      return String.fromCharCode(
        0xd800 + (codePt >> 10),
        0xdc00 + (codePt & 0x3ff)
      );
    }
    return String.fromCharCode(codePt);
  }
};
