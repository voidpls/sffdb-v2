const config = require('./config.js').config()
const { SHEETS_SERVICE_EMAIL, SHEETS_PRIVATE_KEY } = process.env
const { promisify } = require('util')
const extractSheets = promisify(require('spreadsheet-to-json').extractSheets)
// const Fuse = require('fuse.js')
const timeFormat = hrend => ~~(hrend[0] * 1000 + hrend[1] / 10e5)

// Main function: Grab and process Sheets
async function getSheets (bot) {
  const rawSheets = await downloadSheets()
  if (!rawSheets) return
  const sheets = await refactorSheets(rawSheets)
  if (!sheets) return
  // Set bot status for funsies
  bot.user.setActivity(`${sheets.length} components`, {
    type: 'WATCHING'
  })

  const arrMemSize = require('object-sizeof')(sheets)
  const arrMemSizeFormatted = ~~(arrMemSize / 1e5) / 10
  console.info(`[SHEETS] ${sheets.length} total entries, taking up ${arrMemSizeFormatted} MB`)
  bot.index = sheets
}

// Download all sheets in the Google Sheets document
async function downloadSheets () {
  const startExtract = process.hrtime()

  // Extracts Sheets Document as JSON object, with a key:array entry for each sheet
  const rawSheets = await extractSheets({
    spreadsheetKey: config.sheets.key,
    sheetsToExtract: Object.keys(config.sheets.metadata),
    credentials: {
      private_key: SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: SHEETS_SERVICE_EMAIL
    }
  })

  if (!rawSheets) return console.error('[SHEETS] Failed to download')

  // Benchmarks API interaction/download time. This is the most time-costly part of the process
  const time = timeFormat(process.hrtime(startExtract))
  const numSheets = Object.keys(rawSheets).length
  console.info(`[SHEETS] Downloaded ${numSheets} Sheets in: ${time}ms`)
  return rawSheets
}

// Refactor sheets object, to prepare for indexing
// Makes one big array with every row from the sheets
// Not pretty but gets the job done
async function refactorSheets (rawSheets) {
  const sheetsArray = []

  for (const sheet of Object.keys(rawSheets)) {
    for (const row of rawSheets[sheet]) {
      row.category = config.sheets.metadata[sheet].category

      // Clean up GPU data, add some fields
      if (row.category === 'Graphics Cards') {
        const memoryMatch = row.Model.match(/\s(GDDR[^\s]+)/)
        row.Memory = memoryMatch ? memoryMatch[1] : '' // => GDDR6
        row.Model = row.Model.replaceAll(/\sGDDR[^\s]+/g, '') // RTX 2080 Ti 11GB GDDR6 => RTX 2080 Ti 11GB
        const modelMatch = row.Model.match(/\s(.+?)\s\d+GB/)
        row.simpleModel = modelMatch ? modelMatch[1] : '' // RTX 2080 Ti 11GB => 2080 Ti
      }

      switch (row.category) {
        case 'Cases':
          row.INDEX = `${row.Seller} ${row.Case}`
          break
        case 'Coolers (Air)':
          row.INDEX = `${row.Brand} ${row.Cooler}`
          break
        case 'Coolers (AIO)':
          row.INDEX = `${row.Brand} ${row.Model}`
          break
        case 'Slim Fans':
          row.INDEX = `${row.Brand} ${row.Model}`
          break
        case 'Mobos (ITX)':
          row.INDEX = `${row.Brand} ${row.Chipset} ${row.Name}`
          break
        case 'Graphics Cards': {
          const cleanName = row.Name.replaceAll(row.simpleModel, '')
          row.INDEX = `${row.Brand} ${row.Model} ${cleanName}`
          break
        }
      }

      sheetsArray.push(row)
    }
  }
  return sheetsArray
}

exports.getSheets = getSheets
