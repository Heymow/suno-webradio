const request = require("supertest");
const { User } = require("../models/users");
const { Playlist } = require("../models/playlists");
const { SunoSong } = require("../models/sunoSongs");
const sunoService = require("../services/suno.service");
const mongoose = require("mongoose");

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
jest.mock("../models/connection", () => ({})); // Mock connection to prevent side effects

jest.mock("../middlewares/auth", () => ({
  verifyToken: (req, res, next) => {
    req.userId = "mockUserId";
    next();
  },
}));

const app = require("../app");

describe("Suno API Controller", () => {
  let mockUser;
  let mockPlaylist;
  let mockSunoSong;

  const mockSunoClip = {
    id: "5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
    entity_type: "song_schema",
    video_url: "https://cdn1.suno.ai/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.mp4",
    audio_url: "https://cdn1.suno.ai/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.mp3",
    image_url:
      "https://cdn2.suno.ai/image_5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.jpeg",
    image_large_url:
      "https://cdn2.suno.ai/image_large_5067b2fd-4ad4-47e5-8140-43a29e7ac9d6.jpeg",
    major_model_version: "v4",
    model_name: "chirp-v4",
    metadata: {
      tags: "reggey, ska stealdrumm, up beat, kölsch",
      prompt: "(Intro)\nEy, ich stonn he am Strand...",
      type: "gen",
      duration: 184.92,
      can_remix: true,
      is_remix: false,
    },
    user_id: "6f37e09d-0c89-43b5-bc69-0225ec367b14",
    display_name: "DiggerMc",
    handle: "diggermc",
    avatar_image_url: "https://cdn1.suno.ai/b9dbe5f2.webp",
    title: "Neu-Deutsch Jamaika (Usedom Vibes op Kölsch)",
    play_count: 107,
    upvote_count: 39,
    is_public: true,
  };

  const mockSunoUser = {
    user_id: "6f37e09d-0c89-43b5-bc69-0225ec367b14",
    display_name: "DiggerMc",
    handle: "diggermc",
    profile_description: "Meine songs dürfen benutzt...",
    avatar_image_url: "https://cdn1.suno.ai/b9dbe5f2.webp",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: "mockUserId",
      username: "testuser",
      sunoUsername: "DiggerMc",
      claimed: true,
      myMusicSent: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockPlaylist = {
      _id: "playlistId",
      name: "New",
      songs: [],
      save: jest.fn().mockResolvedValue(true),
    };

    mockSunoSong = {
      _id: "songId",
      sunoLink: "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
      author: "DiggerMc",
      save: jest.fn().mockResolvedValue(true),
    };

    User.findById.mockResolvedValue(mockUser);
    Playlist.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPlaylist),
    });
    SunoSong.findOne.mockResolvedValue(null);
    SunoSong.mockImplementation(() => mockSunoSong);

    sunoService.getClip.mockResolvedValue(mockSunoClip);
    sunoService.getUser.mockResolvedValue(mockSunoUser);
    sunoService.transformProjectData.mockReturnValue({
      id: mockSunoClip.id,
      name: mockSunoClip.title,
      author: mockSunoClip.display_name,
      // ... other fields
    });
  });

  describe("POST /suno-api/submit-link", () => {
    it("should successfully add a new song to the playlist", async () => {
      const res = await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Song successfully added to the playlist");
      expect(sunoService.getClip).toHaveBeenCalledWith(
        "5067b2fd-4ad4-47e5-8140-43a29e7ac9d6"
      );
      expect(sunoService.getUser).toHaveBeenCalledWith(
        "6f37e09d-0c89-43b5-bc69-0225ec367b14"
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockPlaylist.save).toHaveBeenCalled();
    });

    it("should update user avatar if it differs from Suno profile", async () => {
      mockUser.avatar = "old_avatar.jpg";
      
      await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(mockUser.avatar).toBe(mockSunoUser.avatar_image_url);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should reject if user is not claimed", async () => {
      mockUser.claimed = false;
      
      const res = await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("verify your account");
    });

    it("should reject if user has no sunoUsername linked", async () => {
      mockUser.sunoUsername = null;
      
      const res = await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("link your Suno account");
    });

    it("should reject if song author does not match user sunoUsername", async () => {
      mockUser.sunoUsername = "OtherUser";
      
      const res = await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('This song belongs to "DiggerMc"');
    });

    it("should reject if user has already 3 songs in the playlist", async () => {
      mockPlaylist.songs = [
        { userId: "mockUserId" },
        { userId: "mockUserId" },
        { userId: "mockUserId" },
      ];
      
      const res = await request(app)
        .post("/suno-api/submit-link")
        .send({
          sunoLink:
            "https://suno.com/song/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("limit of 3 songs");
    });
  });

  describe("GET /suno-api/get-suno-clip/:sunoLink", () => {
    it("should return project data for valid link", async () => {
      const res = await request(app).get(
        "/suno-api/get-suno-clip/5067b2fd-4ad4-47e5-8140-43a29e7ac9d6"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(sunoService.getClip).toHaveBeenCalledWith(
        "5067b2fd-4ad4-47e5-8140-43a29e7ac9d6"
      );
    });

    it("should return 404 if project not found", async () => {
      sunoService.getClip.mockResolvedValue({}); // No metadata

      const res = await request(app).get(
        "/suno-api/get-suno-clip/invalid-id"
      );

      expect(res.statusCode).toBe(404);
    });
  });

  describe("Suno API v5 Compatibility", () => {
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
      sunoService.getClip.mockResolvedValue(mockSunoClipV5);
    });

    it("should handle getSunoClipExtended with concat_history", async () => {
      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/6f2a9077-43ff-4a80-b6b4-c1cf09ea1264"
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.project.originId).toBe(
        "6ba96bb9-e209-4b2a-a73b-81ca409f231e"
      );
    });

    it("should handle getSunoClipInfo with concat_history", async () => {
      const res = await request(app).get(
        "/suno-api/get-suno-clip-infill/6f2a9077-43ff-4a80-b6b4-c1cf09ea1264"
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.project.originId).toBe(
        "c88bc7f8-1800-4235-ac89-b31947f5ae0f"
      );
    });

    it("should handle v5 response without history/concat_history", async () => {
      const mockSunoClipV5NoHistory = {
        id: "5d0dd699-f645-4b18-97e8-e0c975cea351",
        entity_type: "song_schema",
        video_url: "",
        audio_url:
          "https://cdn1.suno.ai/5d0dd699-f645-4b18-97e8-e0c975cea351.mp3",
        image_url:
          "https://cdn2.suno.ai/image_5d0dd699-f645-4b18-97e8-e0c975cea351.jpeg",
        image_large_url:
          "https://cdn2.suno.ai/image_large_5d0dd699-f645-4b18-97e8-e0c975cea351.jpeg",
        major_model_version: "v5",
        model_name: "chirp-crow",
        metadata: {
          tags: "Church Bells...",
          prompt: "...",
          type: "gen",
          duration: 244.52,
          refund_credits: false,
          stream: true,
          task: "",
          can_remix: true,
          is_remix: false,
          priority: 10,
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
        display_tags: "vocal trance, Russian hip hop pop, cinematic electro",
        created_at: "2025-12-02T18:07:25.509Z",
        status: "complete",
        title: "A queen — or maybe..",
        play_count: 12,
        upvote_count: 1,
        is_public: false,
        allow_comments: true,
      };

      sunoService.getClip.mockResolvedValue(mockSunoClipV5NoHistory);

      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/5d0dd699-f645-4b18-97e8-e0c975cea351"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      // Should fallback to own ID if no history
      expect(res.body.project.originId).toBe(
        "5d0dd699-f645-4b18-97e8-e0c975cea351"
      );
    });

    it("should handle v5 upsample response", async () => {
      const mockSunoClipV5Upsample = {
        id: "5e0fc175-2b2f-4134-b329-67084ed55cdd",
        entity_type: "song_schema",
        video_url:
          "https://cdn1.suno.ai/5e0fc175-2b2f-4134-b329-67084ed55cdd.mp4",
        audio_url:
          "https://cdn1.suno.ai/5e0fc175-2b2f-4134-b329-67084ed55cdd.mp3",
        image_url:
          "https://cdn2.suno.ai/video_upload_0812c02f-e86b-4822-870d-749caa8737c7_video_upload_0812c02f-e86b-4822-870d-749caa8737c7_cover_snapshot_0s_1764646347_image.jpeg",
        image_large_url:
          "https://cdn2.suno.ai/video_upload_0812c02f-e86b-4822-870d-749caa8737c7_video_upload_0812c02f-e86b-4822-870d-749caa8737c7_cover_snapshot_0s_1764646347_image.jpeg",
        major_model_version: "v5",
        model_name: "chirp-carp",
        metadata: {
          tags: "Lo-fi Christmas...",
          prompt: "...",
          edited_clip_id: "00000000-0000-0000-0000-000000000000",
          type: "upsample",
          duration: 149.96,
          refund_credits: false,
          stream: false,
          upsample_clip_id: "1f058b3b-a2e5-48a1-acb4-80e13d5a53e9",
          task: "upsample",
          can_remix: true,
          is_remix: true,
          priority: 10,
        },
        is_liked: false,
        user_id: "c6ab57a5-231a-4d82-9eac-db62deb96da8",
        display_name: "S5",
        handle: "s5schwatch",
        is_handle_updated: true,
        avatar_image_url:
          "https://cdn2.suno.ai/379cd6d6-9a8f-4143-9408-461b91f495f0.jpeg",
        is_trashed: false,
        explicit: false,
        comment_count: 10,
        flag_count: 0,
        created_at: "2025-12-01T23:24:25.662Z",
        status: "complete",
        title: "Wonderful World ✧ Santa’s Holiday FM",
        play_count: 1307,
        upvote_count: 165,
        is_public: true,
        allow_comments: true,
      };

      sunoService.getClip.mockResolvedValue(mockSunoClipV5Upsample);

      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/5e0fc175-2b2f-4134-b329-67084ed55cdd"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      // Should use upsample_clip_id as originId
      expect(res.body.project.originId).toBe(
        "1f058b3b-a2e5-48a1-acb4-80e13d5a53e9"
      );
    });

    it("should handle v5 cover response", async () => {
      const mockSunoClipV5Cover = {
        id: "9670b89d-2c99-448b-9319-88dca39a6ec4",
        entity_type: "song_schema",
        video_url:
          "https://cdn1.suno.ai/9670b89d-2c99-448b-9319-88dca39a6ec4.mp4",
        audio_url:
          "https://cdn1.suno.ai/9670b89d-2c99-448b-9319-88dca39a6ec4.mp3",
        image_url:
          "https://cdn2.suno.ai/63a59927-cd84-49be-aeb0-9535cb232cf7.jpeg",
        image_large_url:
          "https://cdn2.suno.ai/63a59927-cd84-49be-aeb0-9535cb232cf7.jpeg",
        major_model_version: "v5",
        model_name: "chirp-crow",
        metadata: {
          tags: "folk, acoustic...",
          prompt: "...",
          edited_clip_id: "00000000-0000-0000-0000-000000000000",
          type: "gen",
          duration: 149.96,
          refund_credits: false,
          stream: true,
          task: "cover",
          can_remix: true,
          is_remix: true,
          priority: 10,
        },
        is_liked: false,
        user_id: "fad79026-59d9-4f91-be4d-8e4daca9bafc",
        display_name: "Snow❄️",
        handle: "frozenharmony224",
        is_handle_updated: true,
        avatar_image_url:
          "https://cdn2.suno.ai/9a92a213-2079-4f9a-9b7d-a59437b7bd46.jpeg",
        is_trashed: false,
        explicit: false,
        comment_count: 10,
        flag_count: 0,
        display_tags: "folk, acoustic",
        created_at: "2025-12-02T09:38:32.755Z",
        status: "complete",
        title: "Silver Grass and the Sea🌾🌊",
        play_count: 260,
        upvote_count: 138,
        is_public: true,
        allow_comments: true,
      };

      sunoService.getClip.mockResolvedValue(mockSunoClipV5Cover);

      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/9670b89d-2c99-448b-9319-88dca39a6ec4"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      // Should fallback to own ID as no history/upsample/cover info
      expect(res.body.project.originId).toBe(
        "9670b89d-2c99-448b-9319-88dca39a6ec4"
      );
    });

    it("should handle studio export response with empty major_model_version", async () => {
      const mockSunoClipStudioExport = {
        id: "dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d",
        entity_type: "song_schema",
        video_url: "https://cdn1.suno.ai/dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d.mp4",
        audio_url: "https://cdn1.suno.ai/dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d.mp3",
        image_url: "https://cdn2.suno.ai/51abed48-7947-4234-b3cf-c826d6551fe6.jpeg",
        image_large_url: "https://cdn2.suno.ai/51abed48-7947-4234-b3cf-c826d6551fe6.jpeg",
        major_model_version: "",
        model_name: "chirp-chirp",
        metadata: {
          tags: "",
          prompt: "Lyrics...",
          type: "studio_export",
          duration: 328.3442083333333,
          can_remix: false,
          is_remix: false
        },
        is_liked: false,
        user_id: "fdf59816-eb57-4568-a93e-86e21edfd470",
        display_name: "Heymow",
        handle: "heymow",
        is_handle_updated: true,
        avatar_image_url: "https://cdn1.suno.ai/2a4f5983.webp",
        is_trashed: false,
        explicit: false,
        comment_count: 16,
        flag_count: 0,
        display_tags: "Rap ",
        created_at: "2025-11-23T07:52:52.159Z",
        status: "complete",
        title: "Stove Light On",
        play_count: 801,
        upvote_count: 169,
        is_public: true,
        allow_comments: true
      };

      sunoService.getClip.mockResolvedValue(mockSunoClipStudioExport);

      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.project.originId).toBe(
        "dfa4cf3e-8fe4-4bbb-bb02-c25d96f5c45d"
      );
      // Verify modelVersion fallback
      expect(res.body.project.modelVersion).toBe("chirp-chirp");
    });

    it("should handle speed edit response with empty major_model_version", async () => {
      const mockSunoClipSpeedEdit = {
        id: "8537b0fb-eb3d-4c2a-b85e-f4b47640c285",
        entity_type: "song_schema",
        video_url: "",
        audio_url: "https://cdn1.suno.ai/8537b0fb-eb3d-4c2a-b85e-f4b47640c285.mp3",
        image_url: "https://cdn2.suno.ai/image_ecb44ecd-15a7-4ec3-8f6a-f69e0bf1a666.jpeg",
        image_large_url: "https://cdn2.suno.ai/image_large_ecb44ecd-15a7-4ec3-8f6a-f69e0bf1a666.jpeg",
        major_model_version: "",
        model_name: "chirp-chirp",
        metadata: {
          tags: "",
          prompt: "",
          type: "edit_speed",
          duration: 347.85910416666667,
          can_remix: true,
          is_remix: true
        },
        is_liked: false,
        user_id: "fdf59816-eb57-4568-a93e-86e21edfd470",
        display_name: "Heymow",
        handle: "heymow",
        is_handle_updated: true,
        avatar_image_url: "https://cdn1.suno.ai/2a4f5983.webp",
        is_trashed: false,
        comment_count: 0,
        flag_count: 0,
        created_at: "2025-11-23T06:05:31.606Z",
        status: "complete",
        title: "Stove Light On (0.94x)",
        play_count: 1,
        upvote_count: 0,
        is_public: false,
        allow_comments: true
      };

      sunoService.getClip.mockResolvedValue(mockSunoClipSpeedEdit);

      const res = await request(app).get(
        "/suno-api/get-suno-clip-extend/8537b0fb-eb3d-4c2a-b85e-f4b47640c285"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe(true);
      expect(res.body.project.originId).toBe(
        "8537b0fb-eb3d-4c2a-b85e-f4b47640c285"
      );
      // Verify modelVersion fallback
      expect(res.body.project.modelVersion).toBe("chirp-chirp");
    });
  });
});
