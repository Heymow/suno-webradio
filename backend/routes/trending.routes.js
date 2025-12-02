const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending.controller');
const { verifyToken } = require('../middlewares/auth');


router.get("/:list/:timeSpan", verifyToken, trendingController.getSunoTrendingSongs)


module.exports = router;