const request = require("supertest");
const app = require("../app");
const playerService = require("../services/player.service");

// Mock player service
jest.mock("../services/player.service", () => ({
  getTrackState: jest.fn(),
  forceNextTrack: jest.fn(),
  getNextTracks: jest.fn(),
  addClient: jest.fn(),
  removeClient: jest.fn(),
  startTime: Date.now(),
}));

// Mock playlist init
jest.mock("../services/playlistInitService", () => ({
  initSystemPlaylists: jest.fn().mockResolvedValue(true),
}));

describe("Player API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /player/status should return 404 if no track playing", async () => {
    playerService.getTrackState.mockReturnValue(null);

    const res = await request(app).get("/player/status");
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe("No track currently playing");
  });

  it("GET /player/status should return track info", async () => {
    const mockTrack = {
      name: "Test Track",
      writer: "Test Artist",
      src: "test.mp3",
      img: "test.jpg",
      duration: 120,
      id: "123",
    };
    playerService.getTrackState.mockReturnValue(mockTrack);

    const res = await request(app).get("/player/status");
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe("Test Track");
    expect(res.body.elapsed).toBeDefined();
  });

  it("POST /player/next should force next track", async () => {
    const mockTrack = {
      name: "Next Track",
      writer: "Next Artist",
      src: "next.mp3",
      img: "next.jpg",
      duration: 120,
      id: "456",
    };
    playerService.forceNextTrack.mockReturnValue(mockTrack);

    const res = await request(app).post("/player/next");
    expect(res.statusCode).toEqual(200);
    expect(res.body.track.name).toBe("Next Track");
  });
});
