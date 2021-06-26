const { MessageEmbed } = require('discord.js')
const config = require('../config.js').config()
const { AUTHOR_ID } = process.env

exports.run = async (bot, msg, args) => {
  const cmds = bot.commands
    .sort(c => c.help.name)
    .map(c => `**\`${c.help.name}\`** ${c.help.description}`)

  const author = await bot.users.fetch(AUTHOR_ID)

  const embed = new MessageEmbed()
    .setAuthor(
      bot.user.username,
      bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    )
    .setColor(config.bot.color)
    .setTitle('Bot Help')
    .setDescription(cmds.join('\n'))
    .setFooter(`Contact ${author.tag} with any issues`)
  msg.channel.send(embed)
}

exports.help = {
  name: 'help',
  aliases: ['commands'],
  description: 'Sends this message'
}
