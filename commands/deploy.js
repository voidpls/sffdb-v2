const { AUTHOR_ID } = process.env
exports.run = async (bot, msg, args) => {
  if (msg.author.id !== AUTHOR_ID) return
  bot.slashCommands.map(async slashCommand => {
    const command = await bot.application?.commands.create(
      slashCommand.info.data
    )
    if (command) {
      console.info(`[DISCORD] Deployed slash command: ${command.name}`)
      await msg.channel.send(`Deployed slash command: \`${command.name}\``)
    }
  }) // Register slash commands globally
}

exports.help = {
  name: 'deploy',
  aliases: [],
  description: 'Deploys slash commands'
}
