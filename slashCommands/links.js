const config = require('../config.js').config()
const { EmbedBuilder } = require('discord.js')

exports.run = async (bot, int) => {
  const desc = config.links.description
  const linksEmbed = new EmbedBuilder()
    .setAuthor({
      name: bot.user.username,
      url: bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    })
    .setTitle('Useful SFF Resources')
    .setDescription(desc)
    .setColor(config.bot.color)
    // .setFooter({ text: 'Or type "exit" to close this prompt' })

  await int.reply({ embeds: [linksEmbed] })
}

exports.info = {
  name: 'links',
  data: {
    name: 'links',
    description: 'Post a message containing links to SFF resources'
  }
}
