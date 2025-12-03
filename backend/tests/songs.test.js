const request = require('supertest');
const { User } = require('../models/users');
const { SunoSong } = require('../models/sunoSongs');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mock playlist init
jest.mock('../services/playlistInitService', () => ({
  initSystemPlaylists: jest.fn().mockResolvedValue(true)
}));

describe('Songs API', () => {
  let token;
  let userId;
  let songId;

  beforeEach(async () => {
    // Create user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      likesRemainingToday: 10,
      claimed: true
    });
    await user.save();
    userId = user._id;

    // Generate token
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

    // Create song
    const song = new SunoSong({
      name: 'Test Song',
      author: 'Suno User',
      prompt: 'A test song',
      songImage: 'test.jpg',
      avatarImage: 'avatar.jpg',
      modelVersion: 'v3',
      audio: 'test.mp3',
      duration: '2:00',
      sunoLink: 'https://suno.com/song/123',
      userId: userId
    });
    await song.save();
    songId = song._id;
  });

  it('should allow voting for a song', async () => {
    const res = await request(app)
      .post(`/songs/${songId}/vote`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.hasVoted).toBe(true);
    expect(res.body.likesRemainingToday).toBe(9);
    
    // Verify DB
    const updatedSong = await SunoSong.findById(songId);
    expect(updatedSong.radioVoteCount).toBe(1);
    
    const updatedUser = await User.findById(userId);
    expect(updatedUser.likesRemainingToday).toBe(9);
  });
});
