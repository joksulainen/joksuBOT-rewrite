// Dependencies
const config = require('./config.json');
const Discord = require('discord.js');

// Create new Discord client
const bot = new Discord.Client({
	intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

// ephemeral interaction response = only you see it

// Commands
const commands = {
	// General
	info: {
		config: {
			name: 'info',
			description: 'Info about the bot',
		},
		handler: async (interaction) => {
			const appInfo = await bot.application.fetch();
			const embed = new Discord.MessageEmbed()
				.setColor(config.embedColor)
				.setTitle(`${appInfo.name} | Info`)
				.setDescription('The same bot you know and love rewritten in Node.js to bring more control and slash commands')
				.setThumbnail(appInfo.iconURL())
				.setTimestamp()
				.setFooter(`Created by ${appInfo.owner.tag}`, appInfo.owner.displayAvatarURL({dynamic: true}));

			await interaction.reply(embed);
		},
	},
	ping: {
		config: {
			name: 'ping',
			description: 'Pong!',
		},
		handler: async (interaction) => {
			await interaction.reply('Command received, measuring latency...');
			const msg = await interaction.channel.send('Ping...');
			msg.edit(`**Pong!** \`${Date.now() - msg.createdAt}ms\``);
		},
	},
	rng: {
		config: {
			name: 'rng',
			description: 'Returns a random integer between min and max (both inclusive)',
			options: [{
				name: 'max',
				description: 'Max value (Default: 6)',
				type: 'INTEGER',
			},
			{
				name: 'min',
				description: 'Min value (Default: 1)',
				type: 'INTEGER',
			}],
		},
		handler: async (interaction) => {
			const max = interaction.options[0] !== undefined ? interaction.options[0].value : 6;
			const min = interaction.options[1] !== undefined ? interaction.options[1].value : 1;
			if (min > max) {
				interaction.reply(`${min} <= Result <= ${max}\nResult: Try again`);
				return;
			}
			const result = Math.floor(Math.random() * (max - min + 1) + min);

			interaction.reply(`${min} <= Result <= ${max}\nResult: ${result}`);
		},
	},
	// Game management
};
const commandList = Object.keys(commands);

bot.once('ready', async () => {
	const guild = bot.guilds.cache.get(config.guildId);
	// Remove all commands (To flush out unused commands)
	const collectedCommands = await guild.commands.fetch();
	collectedCommands.forEach(async (command) => {
		await guild.commands.delete(command);
	});

	// Create commands from commandList
	commandList.forEach((commandName) => {
		guild.commands.create(commands[commandName].config);
	});

	console.log(`Logged in as ${bot.user.tag}`);
});

bot.on('interaction', async (interaction) => {
	// Execute command handler
	if (!interaction.isCommand()) return;
	if (commandList.includes(interaction.commandName)) {
		await commands[interaction.commandName].handler(interaction);
		return;
	}
});

// Login using token
bot.login(config.token);
