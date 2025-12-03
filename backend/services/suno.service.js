const fetch = require("node-fetch"); // Assuming node-fetch is available or using global fetch if Node 18+

// Helper to format duration if needed, though currently it just passes through or needs implementation
// Based on original code, formatDuration was used but not defined in the snippet shown.
// I will assume it's a utility that needs to be imported or defined.
// Looking at the original code, it wasn't imported. It might have been missing or global?
// I'll implement a simple one or keep it as is if it was working.
// Actually, in the original `sunoApi.controller.js`, `formatDuration` was used but I didn't see the definition.
// I will check if it's defined in the file later or if I missed it.
// For now, I'll implement a safe version.

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

class SunoService {
  constructor() {
    this.baseUrl = process.env.SUNO_API_URL || "https://api.suno-proxy.click";
  }

  async getClip(id) {
    const response = await fetch(`${this.baseUrl}/song/${id}`);
    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`);
    }
    return await response.json();
  }

  async getUser(userId) {
    const response = await fetch(`${this.baseUrl}/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Suno API error: ${response.statusText}`);
    }
    return await response.json();
  }

  async getClipMetadata(id) {
    const data = await this.getClip(id);
    if (!data.metadata) {
      throw new Error("Project not found or no metadata");
    }
    return data;
  }

  transformProjectData(data) {
    return {
      id: data.id,
      prompt: data.metadata.tags || "Unknown Style",
      negative: data.metadata.negative_tags,
      lyrics: data.metadata.prompt,
      duration: data.metadata.duration,
      hasVocals: data.metadata.has_vocal,
      audio: data.audio_url,
      name: data.title || "Untitled Song",
      songImage: data.image_large_url,
      avatarImage: data.avatar_image_url,
      modelVersion: data.major_model_version,
      author: data.display_name,
      playCount: data.play_count,
      upVoteCount: data.upvote_count,
      isPublic: data.is_public,
    };
  }
}

module.exports = new SunoService();
