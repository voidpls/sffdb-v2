const config = require('../config.js').config()
const _ = require('lodash')
const { MessageEmbed } = require('discord.js')
const collectors = new Map() // All collectors, by user ID

exports.run = async (bot, msg, args) => {
  const query = args.join(' ')
  if (!bot.index) {
    const error = '**Error:** Database not initliazed yet. Try again later.'
    return msg.channel.send(error)
  }
  // Search index for matches
  const res = bot.index.search(query)
  if (res.length === 0) return msg.channel.send('No results found.')
  // console.log(res.map(r => `${r.item.Seller} ${r.item.Case}`).join('\n'))
  console.log('Results:', res.length)
  // if (res.length === 1) // 1 RESULT ONLY, NO PROMPTS
  const categories = _.uniqBy(res, 'item.category').map(e => e.item.category)
  // 1 CATEGORY ONLY, PROMPT FOR COMPONENT SELECTION
  if (categories.length === 1) {
    return await selectComponent(bot, msg, res, categories[0])
  }

  // PROMPT FOR CATEGORY SELECTION
  return await selectCategory(bot, msg, res, categories)
}

// Category prompt
async function selectCategory (bot, msg, res, categories) {
  if (collectors.get(msg.author.id)) {
    collectors.get(msg.author.id).stop('Collector overlap')
  } // Check if user already has active collector, disables it
  const desc = categories.map((c, i) => `\`[${i + 1}]\` ${c}`)

  const categoryEmbed = new MessageEmbed()
    .setAuthor(
      bot.user.username,
      bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    )
    .setDescription('**Type a # to select a category**\n\n' + desc.join('\n'))
    .setColor(config.bot.color)
    .setFooter('Or type "exit" to close this prompt')

  // Collector filter
  const filter = m => {
    if (m.author.id !== msg.author.id) return false
    if (m.content.toLowerCase() === 'exit') return true
    const num = parseInt(m.content)
    if (num && num <= categories.length && num >= 1) return true
  }
  // Message collector
  const m = await msg.channel.send(categoryEmbed)
  const collector = await m.channel.createMessageCollector(filter, {
    max: 1,
    time: 30000
  })
  collectors.set(msg.author.id, collector)
  // Process user input
  collector.on('collect', async col => {
    await col.delete().catch(e => {})
    await m.delete()
    const input = col.content.toLowerCase()
    if (input === 'exit') return
    return selectComponent(bot, msg, res, categories[parseInt(input) - 1])
  })
  // Delete collector from col. map once it's ended
  collector.on('end', () => collectors.delete(msg.author.id))
}

async function selectComponent (bot, msg, res, category) {
  if (collectors.get(msg.author.id)) {
    collectors.get(msg.author.id).stop('Collector overlap')
  } // Check if user already has active collector, disables it
  const components = res.filter(entry => entry.item.category === category)
  if (components.length === 1) return componentInfo(bot, msg, components[0])
  if (components.length > 9) components.length = 9
  const desc = components.map((c, i) => {
    const brandKey = Object.keys(c.item).find(k =>
      config.sheets.brandTitles.includes(k)
    )
    const modelKey = Object.keys(c.item).find(k =>
      config.sheets.modelTitles.includes(k)
    )
    return `\`[${i + 1}]\` ${c.item[brandKey]} - ${c.item[modelKey]}`
  })

  const componentEmbed = new MessageEmbed()
    .setAuthor(
      bot.user.username,
      bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    )
    .setDescription('**Type a # to select a component**\n\n' + desc.join('\n'))
    .setColor(config.bot.color)
    .setFooter('Or type "exit" to close this prompt')

  const filter = m => {
    if (m.author.id !== msg.author.id) return false
    if (m.content.toLowerCase() === 'exit') return true
    const num = parseInt(m.content)
    if (num && num <= components.length && num >= 1) return true
  }
  const m = await msg.channel.send(componentEmbed)
  const collector = await m.channel.createMessageCollector(filter, {
    max: 1,
    time: 30000
  })

  collectors.set(msg.author.id, collector)
  collector.on('collect', async col => {
    await col.delete().catch(e => {})
    await m.delete()
    const input = col.content.toLowerCase()
    if (input === 'exit') return
    return componentInfo(bot, msg, components[parseInt(input) - 1])
  })
  collector.on('end', () => collectors.delete(msg.author.id))
}

async function componentInfo (bot, msg, component) {
  console.log(component.item)
  const template = config.sheets.formatting[component.item.category]
  if (!template) {
    return msg.channel.send(
      `**Error:** Could not display info. Template type \`${component.item.category}\` not found.`
    )
  }
  // console.log(template)
  // Use regex to replace placeholders in template with real component data
  const title = template.title.replace(/{{(.*?)}}/g, (match, $1) => {
    return component.item[$1]
  })
  const desc = template.desc.replace(/{{(.*?)}}/g, (match, $1) => {
    return component.item[$1]
  })

  const embed = new MessageEmbed()
    .setAuthor(
      bot.user.username,
      bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    )
    .setTitle(title)
    .setDescription(desc)
    .setColor(config.bot.color)

  msg.channel.send(embed)
}

exports.help = {
  name: 'search',
  aliases: ['find', 'get'],
  description: 'Looks up a component from the SFF Google Sheets'
}
