const config = require('./config.js').config()
const { SHEETS_SERVICE_EMAIL, SHEETS_PRIVATE_KEY } = process.env
const { promisify } = require('util')
const extractSheets = promisify(require('spreadsheet-to-json').extractSheets)
const Fuse = require('fuse.js')
const timeFormat = hrend => ~~(hrend[0] * 1000 + hrend[1] / 10e5)

// Main function: Grab and process Sheets
async function getSheets (bot) {
  const rawSheets = await downloadSheets()
  if (!rawSheets) return
  const sheets = await refactorSheets(rawSheets)
  if (!sheets) return
  // Set bot status for funsies
  bot.user.setActivity(`${sheets.length} components`, { type: 'WATCHING' })
  const indexed = await indexSheets(sheets)
  bot.index = indexed
}

// Download all sheets in the Google Sheets document
async function downloadSheets () {
  const startExtract = process.hrtime()

  // Extracts Sheets Document as JSON object, with a key:array entry for each sheet
  const rawSheets = await extractSheets({
    spreadsheetKey: config.sheets.key,
    sheetsToExtract: Object.keys(config.sheets.metadata),
    credentials: {
      private_key: SHEETS_PRIVATE_KEY,
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
async function refactorSheets (rawSheets) {
  const sheetsArray = []
  // Makes one big array with every row from the sheets
  // Not pretty but gets the job done
  for (const sheet of Object.keys(rawSheets)) {
    for (const row of rawSheets[sheet]) {
      row.category = config.sheets.metadata[sheet].category

      // hacky workaround for mobos not indexing properly
      if (row.category === 'Mobos (ITX)') {
        row.Chipset_INDEX = `${row.Brand} ${row.Chipset}`
      }

      sheetsArray.push(row)
    }
  }
  return sheetsArray
}

// Index sheets into fuzzy search engine
async function indexSheets (sheets) {
  const options = {
    keys: config.sheets.indexes,
    includeScore: true,
    threshold: 0.4
  } // Configuration for fuzzy search index
  // const index = Fuse.createIndex(config.sheets.indexes, sheets)
  const fuse = new Fuse(sheets, options)
  if (!fuse) return console.error('[SHEETS] Failed to index')

  // Approximate size of index. For reference purposes.
  let fuseSize = require('object-sizeof')(fuse)
  fuseSize = ~~(fuseSize / 1e5) / 10
  console.info(`[SHEETS] Indexed ${sheets.length} entries [${fuseSize} MB]`)

  return fuse
}

exports.getSheets = getSheets
