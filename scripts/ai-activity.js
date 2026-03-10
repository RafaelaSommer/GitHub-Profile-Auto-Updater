const fs = require("fs")
const path = require("path")

const cacheFile = path.join(__dirname, "..", ".github", "cache.json")

function readCache() {
  try {
    const data = fs.readFileSync(cacheFile, "utf8")
    return JSON.parse(data)
  } catch {
    return { lastActivity: 0 }
  }
}

function writeCache(cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
}

function shouldGenerateActivity() {

  const cache = readCache()

  const now = Date.now()

  const diff = now - (cache.lastActivity || 0)

  const minInterval = 3 * 60 * 1000

  if (diff < minInterval) {
    return false
  }

  const randomFactor = Math.random()

  if (randomFactor > 0.5) {

    cache.lastActivity = now
    writeCache(cache)

    return true
  }

  return false
}

module.exports = shouldGenerateActivity