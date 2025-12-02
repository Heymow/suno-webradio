const { User } = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generatePulsifyId } = require('../models/users');

class UserService {
    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET is not defined.');
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('FATAL: JWT_REFRESH_SECRET is not defined.');
        }
    }

    async createUser(userData) {
        const user = await User.create(userData);
        const token = this.generateAccessToken(user._id);
        const refreshToken = this.generateRefreshToken(user._id);
        return { user, token, refreshToken };
    }

    async authenticate(email, password) {
        const user = await User.findOne({ email });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const token = this.generateAccessToken(user._id);
        const refreshToken = this.generateRefreshToken(user._id);

        return { user, token, refreshToken };
    }

    generateAccessToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    }

    generateRefreshToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }

    async getUserById(id) {
        return await User.findById(id);
    }

    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const users = await User.find().skip(skip).limit(limit);
        const total = await User.countDocuments();
        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateUser(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async getPulsifyId(userId) {
        const user = await this.getUserById(userId);
        if (!user) throw new Error('User not found');

        let shouldGenerateNewId = false;
        if (!user.pulsifyId || !user.pulsifyIdGenerationDate) {
            shouldGenerateNewId = true;
        } else {
            const generationTime = new Date(user.pulsifyIdGenerationDate).getTime();
            const currentTime = new Date().getTime();
            const timeDiff = (currentTime - generationTime) / (1000 * 60);
            if (timeDiff > 20) {
                shouldGenerateNewId = true;
            }
        }

        if (shouldGenerateNewId) {
            user.pulsifyId = generatePulsifyId();
            user.pulsifyIdGenerationDate = new Date();
            await user.save();
        }

        let timeRemaining = 0;
        if (user.pulsifyIdGenerationDate) {
            const generationTime = new Date(user.pulsifyIdGenerationDate).getTime();
            const currentTime = new Date().getTime();
            const elapsedMinutes = (currentTime - generationTime) / (1000 * 60);
            timeRemaining = Math.max(0, 20 - elapsedMinutes).toFixed(1);
        }

        return {
            pulsifyId: user.pulsifyId,
            generationDate: user.pulsifyIdGenerationDate,
            timeRemaining
        };
    }
}

module.exports = new UserService();
