const sunoService = require("../services/suno.service");
const { SunoSong } = require("../models/sunoSongs");
const { Playlist } = require("../models/playlists");
const { User } = require("../models/users");

exports.getSunoClip = async (req, res) => {
  try {
    const { sunoLink } = req.params;
    const projectData = await sunoService.getClip(sunoLink);

    if (projectData.metadata) {
      const project = sunoService.transformProjectData(projectData);
      res.json({ result: true, project });
    } else {
      res.status(404).json({ result: false, error: "Projet non trouvé" });
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
        originId:
          projectData.metadata.history[projectData.metadata.history.length - 1]
            .id,
        continue_at:
          projectData.metadata.history[projectData.metadata.history.length - 1]
            .continue_at,
        image: projectData.image_large_url,
        duration: projectData.metadata.duration, // formatDuration removed as it was undefined in original
      };
      res.json({ result: true, project });
    } else {
      res.status(404).json({ result: false, error: "Projet non trouvé" });
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
      res.status(404).json({ result: false, error: "Projet non trouvé" });
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
      res.status(404).json({ result: false, error: "Projet non trouvé" });
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
      return res.status(400).json({ message: "Le lien Suno est requis" });
    }

    const match =
      sunoLink.match(/suno\.ai\/song\/([a-f0-9-]+)/i) ||
      sunoLink.match(/suno\.com\/song\/([a-f0-9-]+)/i);

    if (!match) {
      return res.status(400).json({ message: "Format du lien Suno invalide" });
    }

    const sunoId = match[1];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.claimed) {
      return res.status(403).json({
        message:
          "Please verify your account in your profile before adding music.",
      });
    }

    if (!user.sunoUsername) {
      return res.status(403).json({
        message:
          "Please link your Suno account in your profile before adding music.",
      });
    }

    const playlist = await Playlist.findOne({ name: "New" }).populate("songs");

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist "new" not found' });
    }

    const userSongsInPlaylist = playlist.songs.filter(
      (song) => song.userId && song.userId.toString() === userId.toString()
    ).length;

    if (userSongsInPlaylist >= 3) {
      return res.status(403).json({
        message:
          'You have already reached the limit of 3 songs in the "new" playlist',
      });
    }

    let song = await SunoSong.findOne({ sunoLink });

    if (song) {
      // Vérification de l'auteur pour une chanson existante
      const userSunoName = user.sunoUsername.toLowerCase().trim();
      const songAuthor = song.author.toLowerCase().trim();

      // Note: On ne peut pas vérifier le handle facilement sur une chanson déjà en BDD si on ne l'a pas stocké
      // On suppose que song.author correspond au display_name ou handle
      if (userSunoName !== songAuthor) {
        // Si ça ne matche pas l'auteur stocké, on pourrait vouloir revérifier avec l'API au cas où l'auteur a changé de nom
        // Mais pour l'instant, bloquons si ça ne correspond pas.
        // Une option plus robuste serait de refetcher les infos Suno si le match échoue.

        // Refetch pour être sûr (au cas où le display_name a changé ou si on veut vérifier le handle)
        const projectData = await sunoService.getClip(sunoId);
        if (projectData && projectData.metadata) {
          const apiAuthor = (projectData.display_name || "")
            .toLowerCase()
            .trim();
          const apiHandle = (projectData.handle || "").toLowerCase().trim();

          if (userSunoName !== apiAuthor && userSunoName !== apiHandle) {
            return res.status(403).json({
              message: `This song belongs to "${
                projectData.display_name || projectData.handle
              }", but your account is verified for "${user.sunoUsername}".`,
            });
          }
        } else {
          // Si on ne peut pas refetch, on se fie à la BDD
          return res.status(403).json({
            message: `This song belongs to "${song.author}", but your account is verified for "${user.sunoUsername}".`,
          });
        }
      }

      if (playlist.songs.some((s) => s._id.equals(song._id))) {
        return res
          .status(400)
          .json({ message: "This song is already in the playlist" });
      }
    }

    if (!song) {
      const projectData = await sunoService.getClip(sunoId);

      if (!projectData.metadata) {
        return res
          .status(400)
          .json({ message: "Invalid Suno link or data not found" });
      }

      // Vérification de l'auteur pour une nouvelle chanson
      const userSunoName = user.sunoUsername.toLowerCase().trim();
      const songAuthor = (projectData.display_name || "").toLowerCase().trim();
      const songHandle = (projectData.handle || "").toLowerCase().trim();

      if (userSunoName !== songAuthor && userSunoName !== songHandle) {
        return res.status(403).json({
          message: `This song belongs to "${
            projectData.display_name || projectData.handle
          }", but your account is verified for "${user.sunoUsername}".`,
        });
      }

      // Update user profile with Suno data if missing or just to keep fresh
      if (projectData.user_id) {
        let needsSave = false;
        if (!user.sunoUserId) {
          user.sunoUserId = projectData.user_id;
          needsSave = true;
        }

        // If we have the user_id, let's fetch the full profile to get the latest avatar
        try {
          const sunoProfile = await sunoService.getUser(projectData.user_id);
          if (
            sunoProfile.avatar_image_url &&
            user.avatar !== sunoProfile.avatar_image_url
          ) {
            user.avatar = sunoProfile.avatar_image_url;
            needsSave = true;
          }
          if (
            sunoProfile.display_name &&
            user.sunoUsername !== sunoProfile.display_name
          ) {
            user.sunoUsername = sunoProfile.display_name;
            needsSave = true;
          }
        } catch (err) {
          console.error("Error fetching Suno profile during submission:", err);
          // Fallback to song data if profile fetch fails
          if (
            projectData.avatar_image_url &&
            user.avatar !== projectData.avatar_image_url
          ) {
            user.avatar = projectData.avatar_image_url;
            needsSave = true;
          }
        }

        if (needsSave) {
          await user.save();
        }
      }

      song = new SunoSong({
        ...sunoService.transformProjectData(projectData),
        userId,
        sunoLink,
      });
      await song.save();
    }

    playlist.songs.push(song._id);
    await playlist.save();

    user.myMusicSent.push(song._id);
    await user.save();

    res.status(201).json({
      message: "Song successfully added to the playlist",
      song,
      user: {
        username: user.username,
        sunoUsername: user.sunoUsername,
        avatar: user.avatar,
        _id: user._id,
        isActivated: user.claimed,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la soumission du lien:", error);
    res.status(500).json({
      message: "Erreur lors de la soumission du lien",
      error: error.message,
    });
  }
};
