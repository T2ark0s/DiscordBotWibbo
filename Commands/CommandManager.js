module.exports = class CommandManager {
    constructor(Bot) {
        this.bot = Bot;
    }

    parse(Cmd, msg)
    {
        switch(Cmd)
        {
            case "ping":
            {
                var embed = new Discord.RichEmbed()
				.setTitle("Wibbo")
				.setURL("https://wibbo.org")
				.setDescription("Jason a pris une photo !")
				.setAuthor("Jason")
				.setImage("https://cdn.wibbo.me/photos/babc108290246e1ee4451f33a7b027cb.png");
				msg.channel.send(embed);
                break;
            }
        }
    }
}