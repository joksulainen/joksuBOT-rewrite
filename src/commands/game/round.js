'use strict';

// Dependencies
const config = require('../../../config.json');
const Discord = require('discord.js');

const commandConfig = {
  name: 'round',
  description: 'Manage rounds.',
  defaultPermission: false,
  permissions: [{
    id: config.hosting.hostRoleId,
    type: 'ROLE',
    permission: true,
  }],
  options: [{
    name: 'start',
    description: 'Start a round.',
    type: 'SUB_COMMAND',
    options: [{
      name: 'time',
      description: 'Time in seconds.',
      type: 'INTEGER',
      required: true,
    }],
  }, {
    name: 'end',
    description: 'End a round.',
    type: 'SUB_COMMAND',
  }, {
    name: 'cancel',
    description: 'Cancel an ongoing round.',
    type: 'SUB_COMMAND',
  }],
};

let round = undefined;

const handler = async (bot, interaction) => {
  await interaction.reply('Command received, processing...', { ephemeral: true });
  const guild = bot.guilds.cache.get(config.guildId);
  const scoreChannel = guild.channels.cache.get(config.hosting.scoreChannelId);
  const lobbyChannel = guild.channels.cache.get(config.hosting.lobbyChannelId);

  const calledSubcommand = interaction.options[0].name;
  if (calledSubcommand === 'start') {
    if (round) return await interaction.editReply('There is an ongoing round');
    const timeS = interaction.options[0].options[0]?.value;
    const timeMs = timeS * 1000;
    const _minutes = Math.floor(timeS / 60);
    const _seconds = ((timeS % 60) < 10) ? `0${timeS % 60}` : String(timeS % 60);

    const scoreEmbed = new Discord.MessageEmbed()
      .setColor('#00ff00')
      .setTitle('Round started')
      .setDescription('Go play that song!')
      .setTimestamp();

    const lobbyEmbed = new Discord.MessageEmbed()
      .setColor(config.embedColor)
      .setTitle('Round has begun')
      .setDescription(`Beat the song in __${_minutes}:${_seconds}__. Good luck!`)
      .setTimestamp();

    await lobbyChannel.send(lobbyEmbed);
    await scoreChannel.send(scoreEmbed);
  } else if (calledSubcommand === 'end') {
    if (!round) return interaction.editReply('There is no ongoing round');
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Round ended')
      .setDescription('The round was ended prematurely.')
      .setTimestamp();

    await scoreChannel.send(embed);
  } else if (calledSubcommand === 'cancel') {
    if (!round) return interaction.editReply('There is no ongoing round');
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Round cancelled')
      .setDescription('The round was cancelled. All scores are void.')
      .setTimestamp();

    await scoreChannel.send(embed);
  }

  await interaction.editReply('Done!');
};

module.exports = {
  config: commandConfig,
  handler,
};
