const express = require('express');
const router = express.Router();
const sunoApiController = require('../controllers/sunoApi.controller');
const { verifyToken } = require('../middlewares/auth');


router.get("/get-suno-clip/:sunoLink", verifyToken, sunoApiController.getSunoClip)
router.get("/get-suno-clip-extend/:id", verifyToken, sunoApiController.getSunoClipExtended)
router.get("/get-suno-clip-cover/:id", verifyToken, sunoApiController.getSunoClipCover)
router.get("/get-suno-clip-infill/:id", verifyToken, sunoApiController.getSunoClipInfo)

// Route pour soumettre un nouveau lien (nécessite authentification)
router.post("/submit-link", verifyToken, sunoApiController.submitSunoLink)

module.exports = router;