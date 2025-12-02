const Joi = require('joi');

const createUserSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().required(),
    token: Joi.string().optional()
});

const updateUserSchema = Joi.object({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    avatar: Joi.string(),
    token: Joi.string()
});

module.exports = { createUserSchema, updateUserSchema }; 