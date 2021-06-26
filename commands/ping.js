exports.run = async (bot, msg, args) => {
  const m = await msg.channel.send('**Pong.** Ping took `    `.')
  const diff = m.createdTimestamp - msg.createdTimestamp
  m.edit(`**Pong.** Ping took \` ${diff}ms \`.`)
}

exports.help = {
  name: 'ping',
  aliases: [],
  description: "Test the bot's latency"
}
