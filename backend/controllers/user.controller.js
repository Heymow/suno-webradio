const userService = require("../services/user.service");
const sunoService = require("../services/suno.service");
const { handleError } = require("../utils/errorHandler");
const { SunoSong } = require("../models/sunoSongs");
const { Playlist } = require("../models/playlists");
const { archivedSong } = require("../models/archivedSunoSongs");

exports.createUser = async (req, res) => {
  try {
    const { user, token } = await userService.createUser(req.body);

    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    handleError(res, error, "error creating user");
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await userService.getAllUsers(page, limit);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, "error retrieving users");
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    handleError(res, error, "error retrieving user");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    handleError(res, error, "error updating user");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    handleError(res, error, "error deleting user");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.authenticate(email, password);

    if (!result) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { user, token, refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        likesRemainingToday: user.likesRemainingToday,
        sunoUsername: user.sunoUsername,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    handleError(res, error, "error logging in user");
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token manquant" });
    }

    const jwt = require("jsonwebtoken");
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await userService.getUserById(decoded.id);

      const newAccessToken = userService.generateAccessToken(user._id);

      res.status(200).json({
        token: newAccessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          sunoUsername: user.sunoUsername || "",
        },
      });
    } catch (error) {
      console.error("Error verifying refresh token:", error);
      return res.status(401).json({ message: "Refresh token invalide" });
    }
  } catch (error) {
    console.error("Error in refreshToken:", error);
    handleError(res, error, "error refreshing token");
  }
};

exports.getPulsifyId = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const result = await userService.getPulsifyId(userId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, "Erreur lors de la récupération du pulsifyId");
  }
};

exports.activatePulsifyAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sunoLink = req.body.sunoLink;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!user.pulsifyId || !user.pulsifyIdGenerationDate) {
      return res.status(400).json({
        message: "Aucun pulsifyId n'a été généré pour cet utilisateur",
      });
    }

    const generationTime = new Date(user.pulsifyIdGenerationDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - generationTime) / (1000 * 60);

    if (timeDiff > 20) {
      const result = await userService.getPulsifyId(userId);
      return res.status(400).json({
        message:
          "Le délai d'activation a expiré. Un nouveau pulsifyId a été généré.",
        pulsifyId: result.pulsifyId,
        generationDate: result.generationDate,
      });
    }

    const sunoService = require("../services/suno.service");
    const match =
      sunoLink.match(/suno\.ai\/song\/([a-f0-9-]+)/i) ||
      sunoLink.match(/suno\.com\/song\/([a-f0-9-]+)/i);

    if (!match) return res.status(400).json({ message: "Lien invalide" });

    const sunoSong = await sunoService.getClip(match[1]);

    if (!sunoSong.metadata.tags.includes(user.pulsifyId)) {
      return res.status(400).json({
        message: "Error while activating Pulsify account",
      });
    }

    user.pulsifyActivationDate = new Date();
    user.claimed = true;
    await user.save();

    res.status(200).json({
      message: "Compte Pulsify activé avec succès",
      result: true,
      pulsifyId: user.pulsifyId,
      activationDate: user.pulsifyActivationDate,
    });
  } catch (error) {
    handleError(res, error, "Erreur lors de l'activation du compte Pulsify");
  }
};

exports.getActivationStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      isActivated: user.claimed === true,
      activationDate: user.pulsifyActivationDate || null,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Erreur lors de la vérification du statut d'activation"
    );
  }
};

exports.getMyMusicSent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { User } = require("../models/users");
    const userWithMusic = await User.findById(userId).populate("myMusicSent");

    if (!userWithMusic) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(userWithMusic.myMusicSent);
  } catch (error) {
    handleError(
      res,
      error,
      "Erreur lors de la récupération des musiques envoyées"
    );
  }
};

exports.getUserAnalyses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { User } = require("../models/users");
    const user = await User.findById(userId).populate("analyses");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user.analyses || []);
  } catch (error) {
    handleError(res, error, "Erreur lors de la récupération des analyses");
  }
};

exports.addUserAnalyse = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { sunoLink } = req.body;

    if (!sunoLink) {
      return res.status(400).json({ message: "Le lien Suno est requis" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.analyses && user.analyses.length >= 5) {
      return res
        .status(400)
        .json({ message: "Nombre maximum d'analyses atteint (5)" });
    }

    const newAnalyse = {
      title: `Analyse ${user.analyses ? user.analyses.length + 1 : 1}`,
      date: new Date(),
      sunoLink,
    };

    if (!user.analyses) {
      user.analyses = [];
    }
    user.analyses.push(newAnalyse);
    await user.save();

    res.status(201).json(newAnalyse);
  } catch (error) {
    handleError(res, error, "Erreur lors de l'ajout de l'analyse");
  }
};

exports.deleteUserAnalyse = async (req, res) => {
  try {
    const userId = req.params.userId;
    const analyseId = req.params.analyseId;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.analyses = user.analyses.filter(
      (analyse) => analyse._id.toString() !== analyseId
    );
    await user.save();

    res.status(200).json({ message: "Analyse supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting analyse:", error);
    handleError(res, error, "Erreur lors de la suppression de l'analyse");
  }
};

exports.deleteUserMusicSent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const songId = req.params.songId;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const sunoSong = await SunoSong.findById(songId);
    if (sunoSong && sunoSong.userId.toString() === userId) {
      const newArchivedSong = new archivedSong({
        name: sunoSong.name,
        author: sunoSong.author,
        prompt: sunoSong.prompt,
        negative: sunoSong.negative,
        lyrics: sunoSong.lyrics,
        songImage: sunoSong.songImage,
        avatarImage: sunoSong.avatarImage,
        playCount: sunoSong.playCount,
        upVoteCount: sunoSong.upVoteCount,
        modelVersion: sunoSong.modelVersion,
        audio: sunoSong.audio,
        duration: sunoSong.duration,
        radioVoteCount: sunoSong.radioVoteCount,
        radioPlayCount: sunoSong.radioPlayCount,
        sunoLink: sunoSong.sunoLink,
        userId: sunoSong.userId,
      });
      await newArchivedSong.save();
      await SunoSong.findByIdAndDelete(songId);
    }

    user.myMusicSent = user.myMusicSent.filter(
      (song) => song._id.toString() !== songId
    );
    await user.save();

    const playlist = await Playlist.findOne({ name: "New" });
    if (playlist) {
      playlist.songs = playlist.songs.filter(
        (song) => song._id.toString() !== songId
      );
      await playlist.save();
    }

    res.status(200).json({ message: "Musique supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting music:", error);
    handleError(res, error, "Erreur lors de la suppression de la musique");
  }
};

exports.claimAccount = async (req, res) => {
  try {
    const { sunoLink } = req.body;
    const userId = req.params.id;

    if (!sunoLink) {
      return res.status(400).json({ message: "Suno link is required" });
    }

    const cleanLink = sunoLink.trim();
    let songId;

    // Try to extract ID from URL
    const urlMatch = cleanLink.match(
      /(?:suno\.com|suno\.ai)\/song\/([a-f0-9-]+)/i
    );
    if (urlMatch) {
      songId = urlMatch[1];
    } else {
      // Check if it's a direct UUID
      const uuidMatch = cleanLink.match(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
      );
      if (uuidMatch) {
        songId = cleanLink;
      }
    }

    if (!songId) {
      console.log("Invalid Suno link format received:", cleanLink);
      return res.status(400).json({ message: "Invalid Suno link format" });
    }

    // Get user to check pulsifyId
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.pulsifyId) {
      return res
        .status(400)
        .json({ message: "No claim code generated for this user" });
    }

    // Fetch song from Suno
    const songData = await sunoService.getClip(songId);

    // Check if pulsifyId is in the prompt/tags
    const prompt = songData.metadata.prompt || "";
    const tags = songData.metadata.tags || "";

    if (prompt.includes(user.pulsifyId) || tags.includes(user.pulsifyId)) {
      // Verification successful
      user.sunoUsername = songData.display_name || songData.handle;
      user.claimed = true;
      user.pulsifyActivationDate = new Date();
      await user.save();

      res.status(200).json({ message: "Account claimed successfully", user });
    } else {
      res
        .status(400)
        .json({ message: "Claim code not found in song tags/prompt" });
    }
  } catch (error) {
    handleError(res, error, "error claiming account");
  }
};
