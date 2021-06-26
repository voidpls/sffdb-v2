exports.config = () => {
  return {
    // Configuration for Google Sheets
    sheets: {
      key: '1AddRvGWJ_f4B6UC7_IftDiVudVc8CJ8sxLUqlxVsCz4', // Key of the Google Sheets document
      indexes: ['Seller', 'Case', 'Brand', 'Model', 'Cooler', 'Name', 'GPU'], // The columns in which information will be indexed
      metadata: {
        // Configure the sheets that are to be downloaded and indexed
        'SFF Case <10L': {
          category: 'Cases' // Category of the component
        }, // Repeat as needed
        'SFF Case 10L-20L': {
          category: 'Cases'
        },
        'MFF Case >20L': {
          category: 'Cases'
        },
        'CPU Cooler <70mm': {
          category: 'Coolers'
        },
        AIO: {
          category: 'Coolers'
        },
        'Slim Fan': {
          category: 'Fans'
        }
      },
      brandTitles: ['Seller', 'Brand', 'GPU'],
      modelTitles: ['Case', 'Cooler', 'Model', 'Name'],
      formatting: {
        // Configure message formatting by category
        Cases: {
          title: '{{Seller}} {{Case}}',
          desc:
            '`Volume` {{Volume (L)}}L [{{Case Length (mm)}} × {{Case Width (mm)}} × {{Case Height (mm)}}mm]\n' +
            '`Style` {{Style}}\n' +
            '`Motherboard` {{Motherboard}}\n' +
            '`CPU Cooler`\n' +
            '<:blank:858431977011281921> Clearance: {{CPU Cooler Height (mm)}}mm\n' +
            '<:blank:858431977011281921> AIO Support: {{AIO / Radiator Support}}\n' +
            '`GPU Support`\n' +
            '<:blank:858431977011281921> Thickness: {{GPU Height / Thickness (mm)}}mm / {{PCIe Slot}} slot(s)\n' +
            '<:blank:858431977011281921> L×W: {{GPU Length (mm)}} × {{GPU Width (mm)}}mm\n' +
            '`PSU Support` {{PSU}}\n' +
            '`Price (USD)` ${{Price (USD)}}'
        }
      }
    },
    // Core bot configuration
    bot: {
      prefix: 'db.', // Bot prefix
      color: 'e6e7e9', // Bot theme color (hex)
      disabledEvents: [
        'GUILD_ROLE_CREATE',
        'GUILD_ROLE_DELETE',
        'GUILD_ROLE_UPDATE',
        'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE',
        'CHANNEL_CREATE',
        'CHANNEL_DELETE',
        'CHANNEL_UPDATE',
        'CHANNEL_PINS_UPDATE',
        'MESSAGE_DELETE_BULK',
        'MESSAGE_REACTION_ADD',
        'MESSAGE_REACTION_REMOVE',
        'MESSAGE_REACTION_REMOVE_ALL',
        'USER_UPDATE',
        'USER_NOTE_UPDATE',
        'USER_SETTINGS_UPDATE',
        'PRESENCE_UPDATE',
        'VOICE_STATE_UPDATE',
        'TYPING_START',
        'VOICE_SERVER_UPDATE',
        'RELATIONSHIP_ADD',
        'RELATIONSHIP_REMOVE'
      ] // Save some memory
    }
  }
}
