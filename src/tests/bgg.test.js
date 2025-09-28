const request = require("supertest");
const app = require("../../server");

// Mock the services
jest.mock("../services/bggService");
jest.mock("../services/similarityService", () => ({
  computeJaccard: jest.fn(),
  mapIdsToNames: jest.fn(),
}));

const bggService = require("../services/bggService");
const similarityService = require("../services/similarityService");

describe("BGG Get Similarity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSimilarity", () => {
    const mockTop100 = [
      { id: "174430", name: "Gloomhaven" },
      { id: "316554", name: "Dune: Imperium" },
      { id: "161936", name: "Pandemic Legacy: Season 1" },
    ];

    const mockUserAGames = ["174430", "316554", "12345"];
    const mockUserBGames = ["316554", "161936", "67890"];

    const mockCommonGames = [{ id: "316554", name: "Dune: Imperium" }];

    it("should return similarity score and common games", async () => {
      // Mock all possible service functions
      bggService.fetchTop100 = jest.fn().mockResolvedValue(mockTop100);
      bggService.fetchUserCollection = jest
        .fn()
        .mockResolvedValueOnce(mockUserAGames)
        .mockResolvedValueOnce(mockUserBGames);

      similarityService.computeJaccard = jest.fn().mockReturnValue({
        intersectionIds: ["316554"], // This is what mapIdsToNames expects
        intersectionCount: 1,
        unionCount: 3,
        jaccard: 0.3333,
      });

      // Add the mapIdsToNames mock
      similarityService.mapIdsToNames = jest
        .fn()
        .mockReturnValue(mockCommonGames);

      const response = await request(app)
        .post("/api/similarity")
        .send({ userA: "userA", userB: "userB" });

      // Debug output
      console.log("Response status:", response.status);
      console.log("Response body:", response.body);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        metadata: { top100_count: 3 },
        userA: { username: "userA", owned_top100_count: 2 },
        userB: { username: "userB", owned_top100_count: 2 },
        similarity: {
          jaccard_score: 0.3333,
          jaccard_percent: "33.33%",
          intersection_count: 1,
          union_count: 3,
          common_games: mockCommonGames,
        },
      });

      expect(bggService.fetchTop100).toHaveBeenCalledTimes(1);
      expect(bggService.fetchUserCollection).toHaveBeenCalledWith("userA");
      expect(bggService.fetchUserCollection).toHaveBeenCalledWith("userB");
    });

    it("should handle user not found error", async () => {
      bggService.fetchTop100 = jest.fn().mockResolvedValue(mockTop100);
      bggService.fetchUserCollection = jest
        .fn()
        .mockRejectedValueOnce(new Error("User not found"));

      const response = await request(app)
        .post("/api/similarity")
        .send({ userA: "nonexistentUser", userB: "userB" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Failed to fetch user collections",
        details: "User not found",
      });

      expect(bggService.fetchTop100).toHaveBeenCalledTimes(1);
      expect(bggService.fetchUserCollection).toHaveBeenCalledWith(
        "nonexistentUser"
      );
    });

    it("should handle internal server error", async () => {
      bggService.fetchTop100 = jest
        .fn()
        .mockRejectedValueOnce(new Error("API down"));

      const response = await request(app)
        .post("/api/similarity")
        .send({ userA: "userA", userB: "userB" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Internal server error");

      expect(bggService.fetchTop100).toHaveBeenCalledTimes(1);
    });
  });
});

