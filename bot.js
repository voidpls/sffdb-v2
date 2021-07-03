require('dotenv').config()
const config = require('./config.js').config()
const { BOT_TOKEN, BOT_PREFIX } = process.env
const { Client, Collection } = require('discord.js')
const fs = require('fs-extra')
const sheets = require('./sheets.js')

// Creates bot client
const bot = new Client({
  disabledEvents: config.bot.disabledEvents,
  messageCacheMaxSize: 50
})

// Loads commands into collection
bot.commands = new Collection()
;(async () => {
  try {
    const files = await fs.readdir('./commands')
    const jsfiles = files.filter(f => f.endsWith('js'))
    jsfiles.forEach((f, i) => {
      const props = require(`./commands/${f}`)
      bot.commands.set(props.help.name.toLowerCase(), props)
    })
  } catch (e) {
    return console.log(e)
  }
  console.log(`[DISCORD] Loaded ${bot.commands.size} commands`)
})()

// Initializes Google Sheets once the bot logs into Discord
bot.once('ready', async () => {
  console.info(`[DISCORD] Connected as ${bot.user.username}`)
  await sheets.getSheets(bot) // Initial fetching of the Google Sheets
  setInterval(async () => {
    await sheets.getSheets(bot)
  }, 30 * 60000) // Fetches the Sheets again every 30 minutes
})

// Discord command handler
bot.on('message', async msg => {
  if (
    msg.author.id === bot.user.id ||
    msg.author.bot ||
    msg.channel.type !== 'text'
  ) {
    return
  }

  if (!msg.content.startsWith(BOT_PREFIX)) return
  const prefixless = msg.content
    .slice(BOT_PREFIX.length)
    .trim()
    .split(' ')
  const cmd = prefixless[0].toLowerCase()
  const args = prefixless.slice(1)
  const cmdFile = bot.commands.get(cmd)

  if (cmdFile) return cmdFile.run(bot, msg, args)
  else {
    bot.commands.forEach(c => {
      if (c.help.aliases.includes(cmd)) return c.run(bot, msg, args)
    })
  }
})

bot.on('error', console.error)
// Log into Discord
bot.login(BOT_TOKEN).catch(e => console.error('[DISCORD] Login failed'))
