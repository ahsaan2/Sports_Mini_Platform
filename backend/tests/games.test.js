const request = require('supertest');
const app = require('../app');
const initDb = require('../scripts/initDb');
const seed = require('../scripts/seed');
const pool = require('../config/database');

describe('Games API', () => {
  let token;
  beforeAll(async () => {
    await initDb();
    await seed();

    const email = `games_test_${Date.now()}@example.com`;
    const password = 'password1';
    const name = 'Games Tester';

    const reg = await request(app).post('/auth/register').send({ name, email, password });
    token = reg.body.token;
  });

  afterAll(async () => {
    try {
      await pool.query("DELETE FROM users WHERE email LIKE 'games_test_%@example.com'");
    } catch (e) {}
    await pool.end();
  });

  test('list/pagination/search', async () => {
    const res = await request(app)
      .get('/games')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 5 });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);

    const qRes = await request(app)
      .get('/games')
      .set('Authorization', `Bearer ${token}`)
      .query({ q: 'Mumbai' });

    expect(qRes.statusCode).toBe(200);
    expect(Array.isArray(qRes.body.items)).toBe(true);
  }, 20000);

  test('favorites add/remove and filter', async () => {
    const allRes = await request(app).get('/games').set('Authorization', `Bearer ${token}`);
    const gameId = allRes.body.items[0].id;

    const add = await request(app).post(`/favorites/${gameId}`).set('Authorization', `Bearer ${token}`);
    expect([200,201]).toContain(add.statusCode);

    const favs = await request(app).get('/games').set('Authorization', `Bearer ${token}`).query({ favorites: true });
    expect(favs.statusCode).toBe(200);
    expect(favs.body.items.find(i => i.id === gameId)).toBeDefined();

    const remove = await request(app).delete(`/favorites/${gameId}`).set('Authorization', `Bearer ${token}`);
    expect(remove.statusCode).toBe(200);

    const favs2 = await request(app).get('/games').set('Authorization', `Bearer ${token}`).query({ favorites: true });
    expect(favs2.body.items.find(i => i.id === gameId)).toBeUndefined();
  }, 20000);
});
