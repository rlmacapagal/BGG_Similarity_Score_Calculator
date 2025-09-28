const axios = require("axios");
const cheerio = require("cheerio");
const { parseStringPromise } = require("xml2js");
const cache = require("../utils/cache");
const TOP100_CACHE_KEY = "top100Games";
const {
  TOP_100_GAMES_URL,
  XMLAPI2_COLLECTION,
  TOP100_TTL_MS,
} = require("../configs");

async function fetchTop100() {
  const cached = cache.get(TOP100_CACHE_KEY);
  if (cached) return cached;

  const response = await axios.get(TOP_100_GAMES_URL, { timeout: 15000 });

  const $ = cheerio.load(response.data);
  const games = [];

  $("a.primary[href*='/boardgame/']").each((i, el) => {
    if (games.length >= 100) return;

    const href = $(el).attr("href") || "";
    const parts = href.split("/").filter(Boolean); // remove falsey values

    if (parts.length >= 2 && parts[0] === "boardgame") {
      const id = String(parts[1]); // Ensure ID is a string
      const name = $(el).text().trim();
      if (!games.some((g) => g.id === id)) {
        games.push({ id, name });
      }
    }
  });

  const top100 = games.slice(0, 100);
  cache.set(TOP100_CACHE_KEY, top100, TOP100_TTL_MS);
  return top100;
}

async function fetchUserCollection(username) {
  if (!username) throw new Error("Username is required");

  const url = `${XMLAPI2_COLLECTION}?username=${encodeURIComponent(
    username
  )}&own=1`;
  const response = await axios.get(url, { timeout: 15000 });
  const xml = response.data;
  const parsed = await parseStringPromise(xml, { explicitArray: false });
  let items = null;
  console.log(parsed, "Parsed XML data from BGG");

  // Check if parsed data exists and handle errors
  if (!parsed) {
    throw new Error(`Failed to parse XML response for user '${username}'`);
  }

  // Check for BGG API errors in parsed XML
  if (parsed.errors) {
    const errorMsg =
      parsed.errors.error?.message ||
      parsed.errors.error ||
      "Unknown BGG API error";
    throw new Error(`BGG API error for user '${username}': ${errorMsg}`);
  }

  // Handle different scenarios
  if (!parsed || !parsed.items) {
    console.log(
      `User ${username} has empty collection or collection is private`
    );
    return []; // Return empty array instead of undefined
  }

  if (!parsed.items.item) {
    console.log(`User ${username} collection exists but has no games`);
    return [];
  }

  if (parsed && parsed.items && parsed.items.item) {
    items = Array.isArray(parsed.items.item)
      ? parsed.items.item
      : [parsed.items.item];

    console.log(parsed.items.item, "Parsed XML data from BGG");
  }

  const arr = Array.isArray(items) ? items : [items];

  const ids = arr
    .map((it) => {
      if (!it) return null;
      if (it.objectid) return String(it.objectid);
      if (it.$ && it.$.objectid) return String(it.$.objectid);
      if (it.id) return String(it.id);
      return null;
    })
    .filter(Boolean);

  return Array.from(new Set(ids)); // Remove duplicates then convert back to array
}

module.exports = { fetchTop100, fetchUserCollection };

