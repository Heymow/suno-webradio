const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');

// Routes publiques pour le player
router.get("/connection", playerController.handleConnection);
router.get("/next-track-info", playerController.getNextTrackInfo);
router.get("/status", playerController.getStatus);
router.post("/next", playerController.nextTrack);
router.post("/switch-playlist/:name", async (req, res) => {
    try {
        const result = await playerController.switchPlaylist(req.params.name);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/current-playlist", (req, res) => {
    const { getCurrentPlaylistName } = require('../controllers/player.controller');
    res.json({ currentPlaylist: getCurrentPlaylistName() });
});

module.exports = router;
