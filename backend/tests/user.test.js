const request = require('supertest');
const { User } = require('../models/users');
const jwt = require('jsonwebtoken');

// Mock the playlist init service to prevent DB calls during app init
jest.mock('../services/playlistInitService', () => ({
  initSystemPlaylists: jest.fn().mockResolvedValue(true)
}));

const app = require('../app'); // Adjust path if necessary

describe('User API', () => {
  it('should set SameSite=Lax on refresh token cookie', async () => {
    // Mock a user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      provider: 'local'
    });
    await user.save();

    // Login to get tokens
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    
    // Check cookie headers
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('SameSite=Lax');
  });
});
