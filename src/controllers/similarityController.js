const bggService = require("../services/bggService");
const similarityService = require("../services/similarityService");

async function getSimilarity(req, res) {
  try {
    const { userA, userB } = req.body;
    if (!userA || !userB) {
      return res
        .status(400)
        .json({ error: "Both userA and userB are required" });
    }

    const top100 = await bggService.fetchTop100(); // Fetch top 100 games
    const topIdsSet = new Set(top100.map((g) => g.id)); // Set of top 100 game IDs
    console.log("Top 100 game IDs:", topIdsSet);

    // Fetch user collections
    try {
      const [userAGameIds, userBGameIds] = await Promise.all([
        bggService.fetchUserCollection(userA),
        bggService.fetchUserCollection(userB),
      ]);

      console.log(`User A has ${userAGameIds.length} games`); // number of games owned by user A
      console.log(`User B has ${userBGameIds.length} games`); // number of games owned by user B

      // Filter to only include games in the top 100
      const ownedA = userAGameIds.filter((id) => topIdsSet.has(id));
      const ownedB = userBGameIds.filter((id) => topIdsSet.has(id));

      const { intersectionIds, intersectionCount, unionCount, jaccard } =
        similarityService.computeJaccard(ownedA, ownedB);
      const commonGames = similarityService.mapIdsToNames(
        intersectionIds,
        top100
      );

      res.json({
        metadata: { top100_count: top100.length },
        userA: { username: userA, owned_top100_count: ownedA.length },
        userB: { username: userB, owned_top100_count: ownedB.length },
        similarity: {
          jaccard_score: Number(jaccard.toFixed(4)),
          jaccard_percent: `${(jaccard * 100).toFixed(2)}%`,
          intersection_count: intersectionCount,
          union_count: unionCount,
          common_games: commonGames,
        },
      });
    } catch (error) {
      return res.status(404).json({
        error: "Failed to fetch user collections",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("Error in getSimilarity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getTop100(req, res) {
  try {
    const games = await bggService.fetchTop100();
    res.json({
      count: games.length,
      games: games,
    });
  } catch (error) {
    console.error("Error fetching top 100:", error);
    res.status(500).json({
      error: "Failed to fetch top 100 games",
      details: error.message,
    });
  }
}

async function getUserCollection(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        error: "Username parameter is required",
      });
    }

    const gameIds = await bggService.fetchUserCollection(username);

    res.json({
      username,
      gameCount: gameIds.length,
      gameIds: gameIds,
    });
  } catch (error) {
    console.error(
      `Error fetching collection for ${req.params.username}:`,
      error
    );

    // Handle specific error types
    if (error.message.includes("not found")) {
      return res.status(404).json({
        error: `User '${req.params.username}' not found`,
        details: error.message,
      });
    }

    if (error.message.includes("private")) {
      return res.status(403).json({
        error: `User '${req.params.username}' has a private collection`,
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to fetch user collection",
      details: error.message,
    });
  }
}

module.exports = {
  getSimilarity,
  getUserCollection,
  getTop100,
};

