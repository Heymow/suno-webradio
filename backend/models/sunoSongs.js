const mongoose = require('mongoose');

const SunoSongSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    author: { type: String, required: true, index: true },
    prompt: { type: String, required: true },
    negative: { type: String },
    lyrics: { type: String },
    songImage: { type: String, required: true },
    avatarImage: { type: String, required: true },
    playCount: { type: Number, default: 0 },
    upVoteCount: { type: Number, default: 0 },
    modelVersion: { type: String, required: true },
    audio: { type: String, required: true, unique: true },
    duration: { type: String, required: true },
    radioVoteCount: { type: Number, default: 0 },
    radioPlayCount: { type: Number, default: 0 },
    playlistPlays: {
        hits: { type: Number, default: 0 },
        new: { type: Number, default: 0 }
    },
    sunoLink: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const SunoSong = mongoose.model('SunoSong', SunoSongSchema);

module.exports = { SunoSong };