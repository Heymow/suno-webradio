const Joi = require('joi');

// Validation pour la création d'une chanson
const createSongSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    author: Joi.string().min(3).max(50).required(),
    prompt: Joi.string().optional(),
    negative: Joi.string().optional(),
    lyrics: Joi.string().optional(),
    songImage: Joi.string().uri().optional(),
    avatarImage: Joi.string().uri().optional(),
    modelVersion: Joi.string().required(),
    audio: Joi.string().uri().required(),
    duration: Joi.number().min(10).max(900).required() // Durée entre 10s et 15min
});

// Validation pour la mise à jour d'une chanson
const updateSongSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    author: Joi.string().min(3).max(50).optional(),
    prompt: Joi.string().optional(),
    negative: Joi.string().optional(),
    lyrics: Joi.string().optional(),
    songImage: Joi.string().uri().optional(),
    avatarImage: Joi.string().uri().optional(),
    modelVersion: Joi.string().optional(),
    audio: Joi.string().uri().optional(),
    duration: Joi.number().min(10).max(900).optional()
});

module.exports = { createSongSchema, updateSongSchema };
