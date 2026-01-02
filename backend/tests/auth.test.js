const request = require('supertest');
const app = require('../app');
const initDb = require('../scripts/initDb');
const seed = require('../scripts/seed');
const pool = require('../config/database');

describe('Auth API', () => {
  beforeAll(async () => {
    await initDb();
    await seed();
  });

  afterAll(async () => {
    try {
      await pool.query("DELETE FROM users WHERE email LIKE 'testuser_%@example.com'");
    } catch (e) {
      // ignore
    }
    await pool.end();
  });

  test('register -> login -> me', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password1';
    const name = 'Test User';

    const registerRes = await request(app)
      .post('/auth/register')
      .send({ name, email, password });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.token).toBeDefined();

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.email).toBe(email);
  }, 20000);
});
