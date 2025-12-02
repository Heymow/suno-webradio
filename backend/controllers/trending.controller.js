const Trending = require('../models/trending');

async function getSunoTrendingSongs(req, res) {
    const { list, timeSpan } = req.params;
    try {
        const trendingSongs = await fetch(`http://localhost:8000/trending/${list}/${timeSpan}`);
        const trendingSongsData = await trendingSongs.json();
        const trendingSong = []
        for (let song of trendingSongsData.sections[0].items) {
            trendingSong.push({ id: song.id, title: song.title, artist: song.artist, image: song.image_url, audio: song.audio_url })
        }

        res.json(trendingSong);
    } catch (error) {
        console.error('Error fetching trending songs:', error);
        res.status(500).json({ error: 'Error fetching trending songs' });
    }
}

module.exports = { getSunoTrendingSongs };

