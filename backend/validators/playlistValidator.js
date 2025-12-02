const Joi = require('joi');

// Schéma pour créer une playlist (tous les champs requis)
const createPlaylistSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    writer: Joi.string().min(3).max(50).required(),
    img: Joi.string().uri().required(),
    src: Joi.string().uri().required(),
    songIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).required()
});

// Schéma pour mettre à jour une playlist (tous les champs facultatifs)
const updatePlaylistSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    writer: Joi.string().min(3).max(50).optional(),
    img: Joi.string().uri().optional(),
    src: Joi.string().uri().optional(),
    songIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
});

module.exports = { createPlaylistSchema, updatePlaylistSchema };
