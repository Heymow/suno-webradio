const { Playlist } = require('../models/playlists');

/**
 * Vérifie et initialise les playlists système (new et hits)
 */
async function initSystemPlaylists() {
    try {
        // Vérification de la playlist "New"
        const newPlaylist = await Playlist.findOne({ name: 'New' });
        if (!newPlaylist) {
            await Playlist.create({
                name: 'New',
                writer: 'system',
                songs: []
            });
            console.log('Playlist "New" créée avec succès');
        }

        // Vérification de la playlist "Hits"
        const hitsPlaylist = await Playlist.findOne({ name: 'Hits' });
        if (!hitsPlaylist) {
            await Playlist.create({
                name: 'Hits',
                writer: 'system',
                songs: []
            });
            console.log('Playlist "Hits" créée avec succès');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des playlists système:', error);
        throw error;
    }
}

module.exports = { initSystemPlaylists }; 