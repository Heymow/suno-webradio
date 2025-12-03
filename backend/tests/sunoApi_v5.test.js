const request = require("supertest");
const app = require("../app");
const sunoService = require("../services/suno.service");

// Mock dependencies
jest.mock("../models/users");
jest.mock("../models/playlists");
jest.mock("../models/sunoSongs");
jest.mock("../services/suno.service");
jest.mock("../services/playlistInitService", () => ({
  initSystemPlaylists: jest.fn().mockResolvedValue(true),
}));
jest.mock("../services/dailyResetService", () => ({
  scheduleDailyReset: jest.fn(),
}));
jest.mock("../models/connection", () => ({}));
jest.mock("../middlewares/auth", () => ({
  verifyToken: (req, res, next) => {
    req.userId = "mockUserId";
    next();
  },
}));

describe("Suno API Controller - v5 Response", () => {
  const mockSunoClipV5 = {
    id: "6f2a9077-43ff-4a80-b6b4-c1cf09ea1264",
    entity_type: "song_schema",
    video_url: "",
    audio_url:
      "https://cdn1.suno.ai/6f2a9077-43ff-4a80-b6b4-c1cf09ea1264.mp3",
    image_url:
      "https://cdn2.suno.ai/image_6ba96bb9-e209-4b2a-a73b-81ca409f231e.jpeg",
    image_large_url:
      "https://cdn2.suno.ai/image_large_6ba96bb9-e209-4b2a-a73b-81ca409f231e.jpeg",
    major_model_version: "v5",
    model_name: "chirp-crow",
    metadata: {
      tags: "cinematic psytrance...",
      prompt: "[Verse]...",
      concat_history: [
        {
          id: "c88bc7f8-1800-4235-ac89-b31947f5ae0f",
          type: "concat_infilling",
          infill: true,
          source: "web",
          infill_dur_s: 11,
          infill_end_s: 310,
          infill_lyrics: "",
          infill_start_s: 299,
          include_future_s: 2,
          include_history_s: 2,
          infill_context_end_s: 340,
          infill_context_start_s: 269,
        },
        {
          id: "6ba96bb9-e209-4b2a-a73b-81ca409f231e",
        },
      ],
      type: "concat_infilling",
      duration: 397.55997916666666,
      persona_id: "10deb074-c265-4964-ab3a-7722810940f8",
      edit_session_id: "429f1754-509b-4969-a524-64ddcd0f1627",
      can_remix: false,
      is_remix: false,
    },
    is_liked: false,
    user_id: "646509e3-df66-4703-bfb5-8b8a2802dffb",
    display_name: "Axi Warrior",
    handle: "axxxi",
    is_handle_updated: true,
    avatar_image_url: "https://cdn1.suno.ai/aa7e916c.webp",
    is_trashed: false,
    explicit: false,
    comment_count: 0,
    flag_count: 0,
    created_at: "2025-12-02T22:38:04.152Z",
    status: "complete",
    title: "Higher Love (Cover)",
    play_count: 4,
    upvote_count: 1,
    is_public: false,
    allow_comments: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sunoService.getClip.mockResolvedValue(mockSunoClipV5);
  });

  it("should handle getSunoClipExtended with concat_history", async () => {
    const res = await request(app).get(
      "/suno-api/get-suno-clip-extend/6f2a9077-43ff-4a80-b6b4-c1cf09ea1264"
    );
    // Expecting failure or 500 currently
    expect(res.statusCode).not.toBe(500);
  });

  it("should handle getSunoClipInfo with concat_history", async () => {
    const res = await request(app).get(
      "/suno-api/get-suno-clip-infill/6f2a9077-43ff-4a80-b6b4-c1cf09ea1264"
    );
    // Expecting failure or 500 currently
    expect(res.statusCode).not.toBe(500);
  });
});
