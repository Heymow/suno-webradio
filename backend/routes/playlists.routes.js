const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { createPlaylistSchema, updatePlaylistSchema } = require('../validators/playlistValidator');
const playlistController = require('../controllers/playlist.controller');

/*
 * ============================================================
 *            ROUTES DE CRÉATION (CREATE)
 * ============================================================
 */

router.post('/', validate(createPlaylistSchema), playlistController.createPlaylist);
router.post('/:id/songs', playlistController.addSongToPlaylist);
router.post('/moveSong', playlistController.moveSongToPlaylist);

/*
 * ============================================================
 *            ROUTES DE LECTURE (READ)
 * ============================================================
 */

router.get('/', playlistController.getAllPlaylists);
router.get('/songCount', playlistController.getTotalSongsCount);
router.get('/:id/time', playlistController.getPlaylistTime);
router.get('/:id/count', playlistController.getPlaylistCount);
router.get('/:id/time-left-before-song', playlistController.getTimeLeftBeforeSong);
router.get('/:id/:songId/isSongInPlaylist', playlistController.isSongInPlaylist);
router.get('/:playlistId/songs', playlistController.getSongsByPlaylist);
router.get('/:id', playlistController.getPlaylistById);

/*
 * ============================================================
 *            ROUTES DE MISE À JOUR (UPDATE)
 * ============================================================
 */

router.patch('/:id', validate(updatePlaylistSchema), playlistController.updatePlaylist);

/*
 * ============================================================
 *            ROUTES DE SUPPRESSION (DELETE)
 * ============================================================
 */

router.delete('/:id', playlistController.deletePlaylist);
router.delete('/:id/songs/:songId', playlistController.removeSongFromPlaylist);
router.delete('/:id/cleanup', playlistController.cleanupPlaylist);

module.exports = router;
