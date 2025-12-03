const request = require("supertest");
const app = require("../app");
const Playlist = require("../models/playlists");
const SunoSong = require("../models/sunoSongs");
const ArchivedSong = require("../models/archivedSunoSongs");

jest.mock("../models/playlists", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("../models/sunoSongs", () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock("../models/archivedSunoSongs", () => jest.fn());
jest.mock("../services/playlistInitService", () => ({
  initSystemPlaylists: jest.fn().mockResolvedValue(),
}));

describe("Playlist API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /playlists", () => {
    it("should return all playlists", async () => {
      const mockPlaylists = [
        { _id: "p1", name: "Playlist 1", songs: [] },
        { _id: "p2", name: "Playlist 2", songs: [] },
      ];
      Playlist.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPlaylists),
      });

      const res = await request(app).get("/playlists");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockPlaylists);
      expect(Playlist.find).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      Playlist.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const res = await request(app).get("/playlists");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("message", "error retrieving playlists");
    });
  });

  describe("POST /playlists", () => {
    it("should create a new playlist", async () => {
      const newPlaylist = {
        name: "My Playlist",
        writer: "User",
        img: "http://example.com/img.jpg",
        src: "http://example.com/src",
        songIds: [],
      };
      const createdPlaylist = { _id: "p3", ...newPlaylist };
      Playlist.create.mockResolvedValue(createdPlaylist);

      const res = await request(app).post("/playlists").send(newPlaylist);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdPlaylist);
      expect(Playlist.create).toHaveBeenCalledWith({
        name: newPlaylist.name,
        writer: newPlaylist.writer,
        img: newPlaylist.img,
        src: newPlaylist.src,
        songs: newPlaylist.songIds,
      });
    });
  });

  describe("DELETE /playlists/:id", () => {
    it("should delete a playlist", async () => {
      const playlistId = "p1";
      const deletedPlaylist = { _id: playlistId, name: "Playlist 1" };
      Playlist.findByIdAndDelete.mockResolvedValue(deletedPlaylist);

      const res = await request(app).delete(`/playlists/${playlistId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(deletedPlaylist);
      expect(Playlist.findByIdAndDelete).toHaveBeenCalledWith(playlistId);
    });

    it("should return 404 if playlist not found", async () => {
      Playlist.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete("/playlists/nonexistent");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Playlist not found");
    });
  });

  describe("POST /playlists/:id/songs", () => {
    it("should add a song to a playlist", async () => {
      const playlistId = "p1";
      const songId = "s1";
      const mockPlaylist = {
        _id: playlistId,
        name: "My Playlist",
        songs: [],
        save: jest.fn(),
      };
      const mockSong = { _id: songId, author: "User1" };

      Playlist.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPlaylist),
      });
      SunoSong.findById.mockResolvedValue(mockSong);

      const res = await request(app)
        .post(`/playlists/${playlistId}/songs`)
        .send({ playlistId, songId });

      expect(res.statusCode).toBe(200);
      expect(mockPlaylist.songs).toContain(songId);
      expect(mockPlaylist.save).toHaveBeenCalled();
    });

    it('should enforce post limit for "New" playlist', async () => {
      const playlistId = "pNew";
      const songId = "sNew";
      const author = "User1";
      const mockPlaylist = {
        _id: playlistId,
        name: "New",
        songs: [
          { _id: "s1", author: author },
          { _id: "s2", author: author },
        ],
        save: jest.fn(),
      };
      const mockSong = { _id: songId, author: author };

      Playlist.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPlaylist),
      });
      SunoSong.findById.mockResolvedValue(mockSong);

      const res = await request(app)
        .post(`/playlists/${playlistId}/songs`)
        .send({ playlistId, songId });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("message", "User post limit reached");
      expect(mockPlaylist.save).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /playlists/:id/songs/:songId", () => {
    it("should remove a song from a playlist", async () => {
      const playlistId = "p1";
      const songId = "s1";
      const mockPlaylist = {
        _id: playlistId,
        songs: [songId],
        save: jest.fn(),
      };
      // Mock pull method on songs array
      mockPlaylist.songs.pull = jest.fn((id) => {
        const index = mockPlaylist.songs.indexOf(id);
        if (index > -1) {
          mockPlaylist.songs.splice(index, 1);
        }
      });

      Playlist.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPlaylist),
      });
      // Mock checkSongOrphanity to return false (song exists in other playlists)
      Playlist.find.mockResolvedValue([{ _id: "p2" }]);

      const res = await request(app).delete(
        `/playlists/${playlistId}/songs/${songId}`
      );

      expect(res.statusCode).toBe(200);
      expect(mockPlaylist.songs).not.toContain(songId);
      expect(mockPlaylist.songs.pull).toHaveBeenCalledWith(songId);
      expect(mockPlaylist.save).toHaveBeenCalled();
    });
  });
});
