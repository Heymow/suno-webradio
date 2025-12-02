const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    writer: { type: String, default: 'system' },
    img: { type: String, default: 'default-playlist.jpg' },
    src: { type: String, default: 'default-playlist.jpg' },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SunoSong' }]
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = { Playlist };