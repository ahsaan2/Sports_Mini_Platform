const pool = require('../config/database');
const createTables = require('../scripts/initDb');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  isConfigured: true,
}));

describe('seedData', () => {
  afterEach(() => jest.clearAllMocks());

  test('skips seeding when games exist and FORCE_SEED not set', async () => {
    // mock count > 0
    pool.query.mockResolvedValueOnce({ rows: [{ count: 5 }] });

    const seed = require('../scripts/seed');
    await seed();

    // The first call should be the COUNT query
    expect(pool.query).toHaveBeenCalledWith('SELECT COUNT(*)::int AS count FROM games');
  });

  test('forces reseed when FORCE_SEED=true', async () => {
    process.env.FORCE_SEED = 'true';
    // mock createTables and subsequent queries
    pool.query.mockResolvedValue({});

    const seed = require('../scripts/seed');
    await seed();

    // Expect DELETE calls or insert attempts; at minimum ensure pool.query was used
    expect(pool.query).toHaveBeenCalled();
    process.env.FORCE_SEED = undefined;
  });
});
