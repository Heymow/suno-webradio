const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Constantes pour les validations
const MAX_AVATAR_SIZE = 1 * 1024 * 1024; // 1MB en bytes
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Fonction pour générer un pulsifyId unique
const generatePulsifyId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "pulsify_";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fonction pour valider le format Base64
const isValidBase64 = (str) => {
  if (!str || str === "default-avatar.png") return true;
  // Allow URLs
  if (str.startsWith("http://") || str.startsWith("https://")) return true;

  try {
    // Vérifie si la chaîne commence par data:image/
    if (!str.match(/^data:image\//)) return false;
    // Extrait la partie Base64
    const base64Data = str.split(",")[1];
    // Vérifie si c'est un format Base64 valide
    return !!base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/);
  } catch (e) {
    return false;
  }
};

// Fonction pour vérifier le type MIME
const isAllowedMimeType = (base64String) => {
  if (!base64String || base64String === "default-avatar.png") return true;
  // Allow URLs
  if (base64String.startsWith("http://") || base64String.startsWith("https://"))
    return true;

  try {
    const mime = base64String.match(
      /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
    );
    return mime && ALLOWED_MIME_TYPES.includes(mime[1]);
  } catch (e) {
    return false;
  }
};

// Fonction pour vérifier la taille
const isValidSize = (base64String) => {
  if (!base64String || base64String === "default-avatar.png") return true;
  // Allow URLs
  if (base64String.startsWith("http://") || base64String.startsWith("https://"))
    return true;

  try {
    const base64Data = base64String.split(",")[1];
    const sizeInBytes = Buffer.from(base64Data, "base64").length;
    return sizeInBytes <= MAX_AVATAR_SIZE;
  } catch (e) {
    return false;
  }
};

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    pulsifyId: {
      type: String,
      required: false,
      unique: true,
      default: null,
    },
    pulsifyIdGenerationDate: {
      type: Date,
      default: null,
    },
    pulsifyActivationDate: {
      type: Date,
      default: null,
    },
    claimed: {
      type: Boolean,
      required: false,
      default: false,
    },
    avatar: {
      type: String,
      required: true,
      default: "default-avatar.png",
      validate: [
        {
          validator: isValidBase64,
          message: "Le format Base64 de l'avatar est invalide",
        },
        {
          validator: isAllowedMimeType,
          message:
            "Le type de fichier n'est pas autorisé. Types acceptés : JPEG, PNG, GIF, WEBP",
        },
        {
          validator: isValidSize,
          message: "L'avatar ne doit pas dépasser 1MB",
        },
      ],
    },
    sunoUsername: {
      type: String,
      required: false,
      default: null,
    },
    sunoUserId: {
      type: String,
      required: false,
      default: null,
    },
    likesRemainingToday: {
      type: Number,
      required: false,
      default: 10,
    },
    myMusicSent: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SunoSong",
      required: false,
      default: [],
    },
    analyses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SunoSong",
      required: false,
      default: [],
    },
    sponsored: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: false,
      default: [],
    },
    lastLogin: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = { User, generatePulsifyId };
