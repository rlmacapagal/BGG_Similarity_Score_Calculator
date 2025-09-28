const TOP_100_GAMES_URL =
  "https://boardgamegeek.com/browse/boardgame?sort=rank";
const XMLAPI2_COLLECTION = "https://boardgamegeek.com/xmlapi2/collection";
const TOP100_TTL_MS = 1000 * 60 * 60 * 6;
const PORT = process.env.PORT || 3000;

module.exports = {
  TOP_100_GAMES_URL,
  XMLAPI2_COLLECTION,
  TOP100_TTL_MS,
  PORT,
};

