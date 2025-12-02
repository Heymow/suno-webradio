const Playlist = require('../models/playlists.js');
const SunoSong = require('../models/sunoSongs.js');
const ArchivedSong = require('../models/archivedSunoSongs.js');
const { handleError } = require('../utils/errorHandler.js');

// Factoriser la récupération d’une playlist
const getPlaylistById = async (playlistId) => {
    const playlist = await Playlist.findById(playlistId).populate('songs');
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
};

const archiveSong = async (song) => {
    await new ArchivedSong(song).save();
    return;
};

const checkSongOrphanity = async (songId) => {
    const playlist = await Playlist.find({ songs: { $in: [songId] } });
    if (playlist.length === 0) {
        return true;
    } else {
        return false;
    }
}

const deleteSong = async (songId) => {
    const song = await SunoSong.findByIdAndDelete(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    return song;
}

const checkUserPostLimit = async (playlistId, author) => {
    const playlist = await Playlist.findById(playlistId).populate('songs');
    if (!playlist) throw new Error('Playlist not found');

    const songs = playlist.songs.filter(song => song.author === author);
    return songs.length >= 2;
}

// Créer une playlist
exports.createPlaylist = async (req, res) => {
    try {
        const { name, writer, img, src, songIds } = req.body;
        const playlist = await Playlist.create({ name, writer, img, src, songs: songIds });
        res.status(201).json(playlist);
    } catch (error) {
        handleError(res, error, 'error creating playlist');
    }
};

// Récupérer toutes les playlists
exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('songs');
        res.status(200).json(playlists);
    } catch (error) {
        handleError(res, error, 'error retrieving playlists');
    }
};

// Supprimer une playlist
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        res.status(200).json(playlist);
    } catch (error) {
        handleError(res, error, 'error deleting playlist');
    }
};

// Ajouter une musique à une playlist
exports.addSongToPlaylist = async (req, res) => {
    try {
        const { songId, playlistId } = req.body;
        const playlist = await getPlaylistById(playlistId);
        const song = await SunoSong.findById(songId);

        if (playlist.name === "New") {
            const isLimitReached = await checkUserPostLimit(playlistId, song.author);
            if (isLimitReached) return res.status(403).json({ message: 'User post limit reached' });
        }

        playlist.songs.push(songId);
        await playlist.save();
        res.status(200).json(playlist);
    } catch (error) {
        handleError(res, error, 'error adding song to playlist');
    }
};

// Supprimer une musique d’une playlist
exports.removeSongFromPlaylist = async (req, res) => {
    try {
        const { id: playlistId, songId } = req.params;
        if (!playlistId || !songId) {
            return res.status(400).json({ error: 'Playlist ID and Song ID are required.' });
        }
        const playlist = await getPlaylistById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found.' });
        }
        playlist.songs.pull(songId);
        await playlist.save();
        const isOrphan = await checkSongOrphanity(songId);

        if (isOrphan) {
            const song = await deleteSong(songId);
            await archiveSong(song);
        }
        res.status(200).json(playlist);
    } catch (error) {
        handleError(res, error, 'error removing song from playlist');
    }
};


// Modifier une playlist
exports.updatePlaylist = async (req, res) => {
    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre en body 
        if (!updatedPlaylist) return res.status(404).json({ message: 'Playlist not found' });
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        handleError(res, error, 'error updating playlist');
    }
};

// Nettoyer une playlist (supprimer la musique la plus ancienne avec radioPlayCount > 1)
exports.cleanupPlaylist = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.id);
        const songs = playlist.songs.sort((a, b) => a.createdAt - b.createdAt);
        const songToDelete = songs.find(song => song.radioPlayCount > 1);

        if (!songToDelete) {
            return res.status(404).json({ message: 'No song to delete' });
        }

        playlist.songs.pull(songToDelete._id);
        await playlist.save();

        const isOrphan = await checkSongOrphanity(songToDelete._id);
        if (!isOrphan) {
            return res.status(200).json({ message: 'song retired from playlist' });
        }

        const deletedSong = await deleteSong(songToDelete._id);
        await archiveSong(deletedSong);
        res.status(200).json({ message: 'Song deleted and archived successfully.' });
    } catch (error) {
        handleError(res, error, 'error deleting song from playlist');
    }
};

// Calculer le temps total de lecture d’une playlist
exports.getPlaylistTime = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.id);
        const time = playlist.songs.reduce((acc, song) => acc + Number(song.duration), 0);
        res.status(200).json({ time });
    } catch (error) {
        handleError(res, error, 'error retrieving playlist time');
    }
};

// Compter le nombre de musiques d’une playlist
exports.getPlaylistCount = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.id);
        res.status(200).json({ count: playlist.songs.length });
    } catch (error) {
        handleError(res, error, 'error retrieving playlist count');
    }
};

// Récupérer le temps restant avant la musique par ID
exports.getTimeLeftBeforeSong = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.playlistId);
        const song = playlist.songs.id(req.params.songId);
        const time = playlist.songs.reduce((acc, s) => s.id === song.id ? acc : acc + Number(s.duration), 0);
        res.status(200).json({ time });
    } catch (error) {
        handleError(res, error, 'error retrieving time left before song');
    }
};

// Déplacer une musique d'une playlist à une autre
exports.moveSongToPlaylist = async (req, res) => {
    try {
        const { from, to, songId } = req.body;
        const fromPlaylist = await getPlaylistById(from);
        const toPlaylist = await getPlaylistById(to);

        const song = fromPlaylist.songs.id(songId);
        if (!song) return res.status(404).json({ message: 'Song not found in playlist' });

        fromPlaylist.songs.pull(songId);
        await fromPlaylist.save();

        toPlaylist.songs.push(song);
        await toPlaylist.save();

        res.status(200).json({ fromPlaylist, toPlaylist });
    } catch (error) {
        handleError(res, error, 'error moving song to playlist');
    }
}

// Récupérer les musiques par l'id d'une playlist
exports.getSongsByPlaylist = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.playlistId).populate("songs"); // ne pas oublier de populer seulement les champs qui nous intéressent
        res.status(200).json(playlist.songs);
    } catch (error) {
        handleError(res, error, 'error retrieving songs by playlist');
    }
};

// Récupérer une playlist par son ID
exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await getPlaylistById(req.params.id);
        res.status(200).json(playlist);
    } catch (error) {
        handleError(res, error, 'error retrieving playlist');
    }
}

// Récupérer le nombre totale de toutes les musiques dans toutes les playlists
exports.getTotalSongsCount = async (req, res) => {
    try {
        const playlists = await Playlist.find();
        const total = playlists.reduce((acc, playlist) => acc + playlist.songs.length, 0);
        res.status(200).json({ total });
    } catch (error) {
        handleError(res, error, 'error retrieving total songs count');
    }
};

// Confirmer si une musique est dans une playlist donnée 
exports.isSongInPlaylist = async (req, res) => {
    const { id: playlistId, songId } = req.params;
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        const song = playlist.songs.id(songId);
        if (!song) return res.status(404).json({ message: 'Song not found in playlist' });

        res.status(200).json({ isSongInPlaylist: true, song });
    } catch (error) {
        handleError(res, error, 'error checking if song is in playlist');
    }
}


