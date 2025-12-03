const { User } = require("../models/users");
const { SunoSong } = require("../models/sunoSongs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generatePulsifyId } = require("../models/users");
const { OAuth2Client } = require("google-auth-library");
const sunoService = require("./suno.service");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error("FATAL: JWT_SECRET is not defined.");
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("FATAL: JWT_REFRESH_SECRET is not defined.");
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

  async googleLogin(idToken) {
    console.log("Google Login initiated");
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log(`Google User: ${email}, ${name}`);

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user from Google");
      let username = name.replace(/\s+/g, "");
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${name.replace(/\s+/g, "")}${counter}`;
        counter++;
      }

      user = await User.create({
        username,
        email,
        avatar: picture || "default-avatar.png",
      });
    } else {
      console.log(
        `Existing user found. Claimed: ${user.claimed}, SunoUserId: ${user.sunoUserId}`
      );
      // Update avatar if not claimed and google picture exists
      if (!user.claimed && picture) {
        console.log("User not claimed, updating avatar from Google");
        user.avatar = picture;
        await user.save();
      } else if (user.claimed) {
        // If claimed, we want to ensure we have the Suno profile data
        if (!user.sunoUserId) {
          console.log(
            "User claimed but missing sunoUserId. Attempting recovery from songs..."
          );
          // Try to recover sunoUserId from submitted music
          try {
            const lastSong = await SunoSong.findOne({ userId: user._id }).sort({
              createdAt: -1,
            });
            if (lastSong && lastSong.sunoLink) {
              // Extract ID
              const match = lastSong.sunoLink.match(
                /(?:suno\.com|suno\.ai)\/song\/([a-f0-9-]+)/i
              );
              if (match) {
                const songData = await sunoService.getClip(match[1]);
                if (songData.user_id) {
                  console.log(`Recovered sunoUserId: ${songData.user_id}`);
                  user.sunoUserId = songData.user_id;
                  await user.save();
                }
              }
            } else {
              console.log("No songs found to recover sunoUserId.");
            }
          } catch (err) {
            console.error("Failed to recover sunoUserId from songs", err);
          }
        }

        if (user.sunoUserId) {
          console.log(`Refreshing Suno profile for userId: ${user.sunoUserId}`);
          // Refresh profile
          try {
            const sunoProfile = await sunoService.getUser(user.sunoUserId);
            if (sunoProfile.avatar_image_url) {
              console.log("Updating avatar from Suno profile");
              user.avatar = sunoProfile.avatar_image_url;
            }
            user.sunoUsername = sunoProfile.display_name || sunoProfile.handle;
            await user.save();
          } catch (error) {
            console.error("Error refreshing Suno profile at login:", error);
          }
        } else if (
          picture &&
          (!user.avatar || user.avatar === "default-avatar.png")
        ) {
          console.log(
            "Fallback: User claimed but no Suno ID, using Google avatar"
          );
          // Fallback to Google if we still don't have Suno ID and avatar is default
          user.avatar = picture;
          await user.save();
        } else {
          console.log("User claimed, no Suno ID, keeping existing avatar.");
        }
      }
    }

    const token = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    return { user, token, refreshToken };
  }

  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
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
      totalPages: Math.ceil(total / limit),
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
    if (!user) throw new Error("User not found");

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
      timeRemaining,
    };
  }
}

module.exports = new UserService();
