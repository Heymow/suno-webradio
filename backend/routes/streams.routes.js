const express = require('express');
const router = express.Router();
const { Playlist } = require('../models/playlists');
const { SunoSong } = require('../models/sunoSongs');

let currentSong = null;
let startTime = null;

// Exemple de route pour démarrer un flux audio
router.get('/start', async (req, res) => {
    try {
        const playlist = await Playlist.findOne().populate('songs');
        if (!playlist || playlist.songs.length === 0) {
            return res.status(404).json({ message: 'No songs in playlist' });
        }

        currentSong = playlist.songs[0];
        startTime = Date.now();

        res.send(`Flux audio démarré avec la chanson: ${currentSong.name}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting audio stream' });
    }
});

// Exemple de route pour arrêter un flux audio
router.get('/stop', (req, res) => {
    currentSong = null;
    startTime = null;
    res.send('Flux audio arrêté');
});

// Exemple de route pour mettre en pause un flux audio
router.get('/pause', (req, res) => {
    // Logique pour mettre en pause le flux audio
    res.send('Flux audio en pause');
});

// Récupérer la position actuelle de lecture
router.get('/current-time', (req, res) => {
    if (!currentSong || !startTime) {
        return res.status(404).json({ message: 'No song is currently playing' });
    }

    const currentTime = (Date.now() - startTime) / 1000; // Temps écoulé en secondes
    res.status(200).json({ currentTime, song: currentSong.name });
});

module.exports = router;
