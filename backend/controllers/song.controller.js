const { SunoSong } = require('../models/sunoSongs');
const { archivedSong: ArchivedSong } = require('../models/archivedSunoSongs');
const { Playlist } = require('../models/playlists');
const { handleError } = require('../utils/errorHandler');
const { User } = require('../models/users');
const { updateCurrentTrackData } = require('./player.controller');

// Récupérer une chanson par ID
const getSongById = async (id) => {
    const song = await SunoSong.findById(id);
    if (!song) throw new Error('Song not found');
    return song;
};

// Créer une musique
exports.createSong = async (req, res) => {
    try {
        const song = await SunoSong.create(req.body);
        res.status(201).json(song);
    } catch (error) {
        handleError(res, error, 'error creating song');
    }
};

// Récupérer toutes les musiques
exports.getAllSongs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const songs = await SunoSong.find().skip(skip).limit(limit);
        const total = await SunoSong.countDocuments();

        res.status(200).json({ total, page, limit, songs });
    } catch (error) {
        handleError(res, error, 'error retrieving songs');
    }
};


// Récupérer une musique par ID
exports.getSongById = async (req, res) => {
    try {
        const song = await getSongById(req.params.id);
        res.status(200).json(song);
    } catch (error) {
        handleError(res, error, 'error retrieving song');
    }
};

// Supprimer une musique et l'archiver
exports.deleteSong = async (req, res) => {
    try {
        const song = await SunoSong.findByIdAndDelete(req.params.id);
        if (!song) return res.status(404).json({ message: 'Song not found' });

        await ArchivedSong.create(song);
        res.status(200).json(song);
    } catch (error) {
        handleError(res, error, 'error deleting song');
    }
};

// Modifier une musique
exports.updateSong = async (req, res) => {
    try {
        const song = await SunoSong.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!song) return res.status(404).json({ message: 'Song not found' });

        res.status(200).json(song);
    } catch (error) {
        handleError(res, error, 'error updating song');
    }
};

// Ajouter une écoute radio
exports.incrementPlayCount = async (req, res) => {
    try {
        const song = await getSongById(req.params.id);
        song.radioPlayCount++;
        await song.save();

        // Mettre à jour les données de la chanson actuelle en temps réel
        await updateCurrentTrackData();

        res.status(200).json(song);
    } catch (error) {
        handleError(res, error, 'error playing song');
    }
};

// Ajouter / Retirer un vote
exports.updateVoteCount = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.claimed) {
            return res.status(403).json({ message: 'Please activate your account to vote for songs' });
        }

        const song = await getSongById(req.params.id);

        // Vérifier si l'utilisateur a déjà voté pour cette chanson
        const hasVoted = song.votedBy.includes(req.userId);

        if (req.method === 'POST') {
            // Vérifier les votes restants seulement pour ajouter un vote
            if (user.likesRemainingToday <= 0) {
                return res.status(403).json({ message: 'No votes remaining today' });
            }
            if (hasVoted) {
                return res.status(400).json({ message: 'You have already voted for this song' });
            }

            song.radioVoteCount++;
            song.votedBy.push(req.userId);
            user.likesRemainingToday--;
            await user.save();
        } else {
            if (!hasVoted) {
                return res.status(400).json({ message: 'You have not voted for this song' });
            }

            song.radioVoteCount--;
            song.votedBy.pull(req.userId);
            user.likesRemainingToday++;
            await user.save();
        }
        await song.save();

        // Mettre à jour les données de la chanson actuelle en temps réel
        await updateCurrentTrackData();

        res.status(200).json({
            song,
            hasVoted: req.method === 'POST',
            likesRemainingToday: user.likesRemainingToday
        });
    } catch (error) {
        handleError(res, error, 'error updating vote');
    }
};

// Récupérer les musiques populaires
exports.getPopularSongs = async (req, res) => {
    try {
        const sortField = req.path.includes('/radio') ? 'radioVoteCount' : 'upVoteCount';
        const songs = await SunoSong.find().sort({ [sortField]: -1 }).limit(100);
        res.status(200).json(songs);
    } catch (error) {
        handleError(res, error, 'error retrieving popular songs');
    }
};

// Calculer le total des votes
exports.getTotalVotes = async (req, res) => {
    try {
        const songs = await SunoSong.find();
        const totalVotes = songs.reduce((acc, song) => acc + song.upVoteCount, 0);
        res.status(200).json({ totalVotes });
    } catch (error) {
        handleError(res, error, 'error retrieving total votes');
    }
};

// Récupérer les musiques selon un critère (auteur, genre, récentes)
exports.getSongsByField = async (req, res) => {
    try {
        const field = req.params.field;
        const value = req.params.value;
        const query = field === 'recent' ? { addedAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } : { [field]: value };

        const songs = await SunoSong.find(query);
        res.status(200).json(songs);
    } catch (error) {
        handleError(res, error, `error retrieving songs by ${req.params.field}`);
    }
};

// Vérifier la durée d'une musique
exports.checkSongLength = async (req, res) => {
    try {
        const song = await getSongById(req.params.id);
        const isValid = song.duration >= 60 && song.duration <= 300;
        res.status(200).json({ isValid });
    } catch (error) {
        handleError(res, error, 'error retrieving song length');
    }
};

// Récupérer uniquement les noms des playlists d'une musique
exports.getPlaylistsBySong = async (req, res) => {
    try {
        const song = await getSongById(req.params.id);
        const playlists = await Playlist.find({ songs: song._id }).select('name');
        res.status(200).json(playlists);
    } catch (error) {
        handleError(res, error, 'error retrieving playlists by song');
    }
};

// Vérifier si l'utilisateur a voté pour une chanson
exports.checkUserVote = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ hasVoted: false });
        }

        const song = await getSongById(req.params.id);
        const hasVoted = song.votedBy.includes(req.userId);

        res.status(200).json({ hasVoted });
    } catch (error) {
        handleError(res, error, 'error checking user vote');
    }
};

// Récupérer le nombre total de musique
exports.getNumberOfSongs = async (req, res) => {
    try {
        if (req.params.playlistId) {
            const playlist = await Playlist.findById
            const songs = playlist.songs;
            const total = songs.length;
            res.status(200).json({ total });
        }
        else {
            const total = await SunoSong.countDocuments();
            res.status(200).json({ total });
        }
    } catch (error) {
        handleError(res, error, 'error retrieving number of songs');
    }
};

