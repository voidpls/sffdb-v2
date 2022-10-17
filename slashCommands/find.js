const config = require('../config.js').config()
const _ = require('lodash')
const { MessageEmbed } = require('discord.js')
const collectors = new Map() // All collectors, by user ID
const { CHANNEL_WHITELIST } = process.env

exports.run = async (bot, int) => {
  const query = int.options.getString('query', true).trim()

  const guildChannels = await int.guild.channels.fetch()
  const whitelist = CHANNEL_WHITELIST.split(',')
  const guildWhitelist = whitelist.filter(channel => guildChannels.has(channel))
  if (guildWhitelist && !guildWhitelist.includes(int.channel.id)) {
    const error =
      "You can't use that in this channel!\n\nPermitted channels:\n" +
      `${guildWhitelist.map(channel => `<#${channel}>`).join('\n')}`
    return int.reply({ content: error, ephemeral: true })
  }

  if (!bot.index) {
    const error = 'Database not initliazed yet. Try again later.'
    return await int.reply({ content: error, ephemeral: true })
  } // Check if index object exists
  if (!query) {
    const error = 'You must specify a search query.'
    return await int.reply({ content: error, ephemeral: true })
  }

  // Search index for matches
  const res = bot.index.search(query)
  if (res.length === 0) return await int.reply('No results found.')
  if (res.length === 1) return await componentInfo(bot, int, res[0]) // 1 RESULT, NO PROMPTS

  const categories = _.uniqBy(res, 'item.category').map(e => e.item.category)

  if (categories.length === 1) {
    return await selectComponent(bot, int, res, categories[0])
  } // 1 CATEGORY, ONLY COMPONENT SELECTION PROMPT

  // CATEGORY SELECTION PROMPT
  return await selectCategory(bot, int, res, categories)
}

// Category prompt
async function selectCategory (bot, int, res, categories) {
  if (collectors.get(int.user.id)) {
    collectors.get(int.user.id).stop('Collector overlap')
  } // Check if user already has active collector, disables it
  const desc = categories.map((c, i) => `\`[${i + 1}]\` ${c}`)

  const categoryEmbed = new MessageEmbed()
    .setAuthor({
      name: bot.user.username,
      url: bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    })
    .setDescription('**Type a # to select a category**\n\n' + desc.join('\n'))
    .setColor(config.bot.color)
    .setFooter({ text: 'Or type "exit" to close this prompt' })

  // Collector filter
  const filter = m => {
    if (m.author.id !== int.user.id) return false
    if (m.content.toLowerCase() === 'exit') return true
    const num = parseInt(m.content)
    if (num && num <= categories.length && num >= 1) return true
  }
  // Message collector
  await int.reply({ embeds: [categoryEmbed] })
  const collector = await int.channel.createMessageCollector({
    filter,
    max: 1,
    time: 30000
  })
  collectors.set(int.user.id, collector)
  // Process user input
  collector.on('collect', async col => {
    await col.delete().catch(e => {})
    // await m.delete()
    const input = col.content.toLowerCase()
    if (input === 'exit') return await int.deleteReply()
    return selectComponent(bot, int, res, categories[parseInt(input) - 1])
  })
  // Delete collector from col. map once it's ended
  collector.on('end', () => collectors.delete(int.user.id))
}

async function selectComponent (bot, int, res, category) {
  if (collectors.get(int.user.id)) {
    collectors.get(int.user.id).stop('Collector overlap')
  } // Check if user already has active collector, disables it
  const components = res.filter(entry => entry.item.category === category)
  if (components.length === 1) return componentInfo(bot, int, components[0])
  if (components.length > 9) components.length = 9
  // console.log(components)
  const desc = components.map((c, i) => {
    // const brandKey = Object.keys(c.item).find(k =>
    //   config.sheets.brandTitles.includes(k)
    // )
    // const modelKey = Object.keys(c.item).find(k =>
    //   config.sheets.modelTitles.includes(k)
    // )
    // return `\`[${i + 1}]\` ${c.item[brandKey]} - ${c.item[modelKey]}`
    return `\`[${i + 1}]\` ${applyTemplate(c).title}`
  })

  const componentEmbed = new MessageEmbed()
    .setAuthor({
      name: bot.user.username,
      url: bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    })
    .setDescription('**Type a # to select a component**\n\n' + desc.join('\n'))
    .setColor(config.bot.color)
    .setFooter({ text: 'Or type "exit" to close this prompt' })

  const filter = m => {
    if (m.author.id !== int.user.id) return false
    if (m.content.toLowerCase() === 'exit') return true
    const num = parseInt(m.content)
    if (num && num <= components.length && num >= 1) return true
  }
  await (int.replied
    ? int.editReply({ embeds: [componentEmbed] })
    : int.reply({ embeds: [componentEmbed] }))
  const collector = await int.channel.createMessageCollector({
    filter,
    max: 1,
    time: 30000
  })

  collectors.set(int.user.id, collector)
  collector.on('collect', async col => {
    await col.delete().catch(e => {})
    // await m.delete()
    const input = col.content.toLowerCase()
    if (input === 'exit') return await int.deleteReply()
    return componentInfo(bot, int, components[parseInt(input) - 1])
  })
  collector.on('end', () => collectors.delete(int.user.id))
}

function applyTemplate (component) {
  const template = config.sheets.formatting[component.item.category]
  if (!template) return null

  const title = template.title.replace(/{{(.*?)}}/gs, (match, $1) => {
    if (!component.item[$1]) return '-'
    return component.item[$1].replace(/\n/g, ' ')
  })
  const desc = template.desc.replace(/{{(.*?)}}/gs, (match, $1) => {
    console.log($1)
    if (component.item[$1] === 'Y') return 'Yes'
    if (!component.item[$1]) return '-'
    return component.item[$1].replace(/\n/g, ' ')
  })

  return { title, desc }
}

async function componentInfo (bot, int, component) {
  if (collectors.get(int.user.id)) {
    collectors.get(int.user.id).stop('Collector overlap')
  } // Check if user already has active collector, disables it

  const formattedData = applyTemplate(component)
  if (!formattedData) {
    const text = `Could not display info. Template type \`${component.item.category}\` not found.`
    await (int.replied ? int.editReply(text) : int.reply(text))
  }
  const { title, desc } = formattedData
  // console.log(template)
  // Use regex to replace placeholders in template with real component data
  // const title = formattedData.title.replace(/{{(.*?)}}/gs, (match, $1) => {
  //   if (!component.item[$1]) return '-'
  //   return component.item[$1].replace(/\n/g, ' ')
  // })
  // const desc = formattedData.desc.replace(/{{(.*?)}}/gs, (match, $1) => {
  //   if (!component.item[$1]) return '-'
  //   return component.item[$1].replace(/\n/g, ' ')
  // })

  const infoEmbed = new MessageEmbed()
    .setAuthor({
      name: bot.user.username,
      url: bot.user.avatarURL({ dynamic: true, size: 128, format: 'png' })
    })
    .setTitle(title)
    .setDescription(desc)
    .setColor(config.bot.color)
    .setFooter({ text: 'Type "exit" to close this prompt' })

  // Collector filter
  const filter = m => {
    if (m.author.id !== int.user.id) return false
    if (m.content.toLowerCase() === 'exit') return true
  }
  // Message collector
  await (int.replied
    ? int.editReply({ embeds: [infoEmbed] })
    : int.reply({ embeds: [infoEmbed] }))
  const collector = await int.channel.createMessageCollector({
    filter,
    max: 1,
    time: 30000
  })
  collectors.set(int.user.id, collector)
  // Process user input
  collector.on('collect', async col => {
    await col.delete().catch(e => {})
    // await m.delete()
    const input = col.content.toLowerCase()
    if (input === 'exit') return await int.deleteReply()
  })
  // Delete collector from col. map once it's ended
  collector.on('end', () => collectors.delete(int.user.id))
}

exports.info = {
  name: 'find',
  data: {
    name: 'find',
    description: 'Look up a component',
    options: [
      {
        type: 3,
        name: 'query',
        description: 'The name of the component',
        required: true
      }
    ]
  }
}
