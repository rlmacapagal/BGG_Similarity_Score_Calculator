const express = require("express");
const router = express.Router();
const similarityController = require("../controllers/similarityController");

router.post("/api/similarity", similarityController.getSimilarity);
router.get("/api/top100", similarityController.getTop100);
router.get("/api/user/:username", similarityController.getUserCollection);

module.exports = router;

