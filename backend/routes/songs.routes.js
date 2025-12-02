const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const { createSongSchema, updateSongSchema } = require('../validators/songValidator');

/*
 * ============================================================
 *                      ROUTES CRUD (Songs)
 * ============================================================
 */

router.post('/', validate(createSongSchema), songController.createSong);
router.get('/', songController.getAllSongs);
router.get('/:id', songController.getSongById);
router.put('/:id', validate(updateSongSchema), songController.updateSong);
router.delete('/:id', songController.deleteSong);
/*
 * ============================================================
 *                    ROUTES - Votes & Écoutes
 * ============================================================
 */

router.post('/:id/play', songController.incrementPlayCount);
router.post('/:id/vote', verifyToken, songController.updateVoteCount);
router.delete('/:id/vote', verifyToken, songController.updateVoteCount);
router.get('/:id/vote-status', verifyToken, songController.checkUserVote);

/*
 * ============================================================
 *                        ROUTES - Popularité
 * ============================================================
 */

router.get('/popular', songController.getPopularSongs);
router.get('/radio/popular', songController.getPopularSongs);

/*
 * ============================================================
 *                     ROUTES - Calcul des Votes
 * ============================================================
 */

router.get('/votes', songController.getTotalVotes);

/*
 * ============================================================
 *                   ROUTES - Recherche Avancée
 * ============================================================
 */

router.get('/:field/:value', songController.getSongsByField);
router.get('/:id/length', songController.checkSongLength);
router.get('/:id/playlist', songController.getPlaylistsBySong);
router.get("/:playlistId/number-of-song", songController.getNumberOfSongs);

module.exports = router;
