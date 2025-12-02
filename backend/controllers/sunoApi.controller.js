const sunoService = require('../services/suno.service');
const { SunoSong } = require('../models/sunoSongs');
const { Playlist } = require('../models/playlists');
const { User } = require('../models/users');

exports.getSunoClip = async (req, res) => {
    try {
        const { sunoLink } = req.params;
        const projectData = await sunoService.getClip(sunoLink);

        if (projectData.metadata) {
            const project = sunoService.transformProjectData(projectData);
            res.json({ result: true, project });
        } else {
            res.status(404).json({ result: false, error: 'Projet non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
};

exports.getSunoClipExtended = async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = await sunoService.getClip(id);

        if (projectData.metadata) {
            const project = {
                id: projectData.id,
                originId: projectData.metadata.history[projectData.metadata.history.length - 1].id,
                continue_at: projectData.metadata.history[projectData.metadata.history.length - 1].continue_at,
                image: projectData.image_large_url,
                duration: projectData.metadata.duration, // formatDuration removed as it was undefined in original
            };
            res.json({ result: true, project });
        } else {
            res.status(404).json({ result: false, error: 'Projet non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
};

exports.getSunoClipCover = async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = await sunoService.getClip(id);

        if (projectData.metadata) {
            const project = {
                id: projectData.id,
                originId: projectData.metadata.cover_clip_id,
                image: projectData.image_large_url,
                duration: projectData.metadata.duration,
            };
            res.json({ result: true, project });
        } else {
            res.status(404).json({ result: false, error: 'Projet non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
};

exports.getSunoClipInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = await sunoService.getClip(id);

        if (projectData.metadata) {
            const project = {
                id: projectData.id,
                originId: projectData.metadata.history[0].id,
                image: projectData.image_large_url,
                duration: projectData.metadata.duration,
            };
            res.json({ result: true, project });
        } else {
            res.status(404).json({ result: false, error: 'Projet non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ result: false, error: error.message });
    }
};

exports.submitSunoLink = async (req, res) => {
    try {
        const { sunoLink } = req.body;
        const userId = req.userId;

        if (!sunoLink) {
            return res.status(400).json({ message: 'Le lien Suno est requis' });
        }

        const match = sunoLink.match(/suno\.ai\/song\/([a-f0-9-]+)/i) ||
            sunoLink.match(/suno\.com\/song\/([a-f0-9-]+)/i);

        if (!match) {
            return res.status(400).json({ message: 'Format du lien Suno invalide' });
        }

        const sunoId = match[1];

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const playlist = await Playlist.findOne({ name: 'New' }).populate('songs');

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist "new" non trouvée' });
        }

        const userSongsInPlaylist = playlist.songs.filter(song => song.userId && song.userId.toString() === userId.toString()).length;

        if (userSongsInPlaylist >= 3) {
            return res.status(403).json({
                message: 'Vous avez déjà atteint la limite de 3 sons dans la playlist "new"'
            });
        }

        let song = await SunoSong.findOne({ sunoLink });

        if (song && playlist.songs.some(s => s._id.equals(song._id))) {
            return res.status(400).json({ message: 'Cette chanson est déjà dans la playlist' });
        }

        if (!song) {
            const projectData = await sunoService.getClip(sunoId);

            if (!projectData.metadata) {
                return res.status(400).json({ message: 'Lien Suno invalide ou données introuvables' });
            }

            song = new SunoSong({
                ...sunoService.transformProjectData(projectData),
                userId,
                sunoLink
            });
            await song.save();
        }

        playlist.songs.push(song._id);
        await playlist.save();

        user.myMusicSent.push(song._id);
        await user.save();

        res.status(201).json({
            message: 'Son ajouté avec succès à la playlist',
            song
        });
    } catch (error) {
        console.error('Erreur lors de la soumission du lien:', error);
        res.status(500).json({
            message: 'Erreur lors de la soumission du lien',
            error: error.message
        });
    }
};