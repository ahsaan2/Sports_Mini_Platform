const pool = require('../config/database');
const createTables = require('./initDb');

const seedData = async () => {
  try {
    // Ensure DB configured before seeding
    if (!pool.isConfigured) {
      throw new Error('DB_PASSWORD is not set. Please set DB_PASSWORD in backend/.env (copy .env.example) and rerun `npm run seed`.');
    }

    // Create tables first
    await createTables();

    // Clear existing data
    await pool.query('DELETE FROM favorites');
    await pool.query('DELETE FROM games');

    // Insert sports matches
    const sportsMatches = [
      {
        game_name: 'Mumbai Indians vs Chennai Super Kings',
        sport: 'Cricket',
        league: 'IPL',
        team_a: 'Mumbai Indians',
        team_b: 'Chennai Super Kings',
        start_time: new Date('2024-05-15T19:30:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Royal Challengers Bangalore vs Kolkata Knight Riders',
        sport: 'Cricket',
        league: 'IPL',
        team_a: 'Royal Challengers Bangalore',
        team_b: 'Kolkata Knight Riders',
        start_time: new Date('2024-05-16T15:30:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Manchester United vs Liverpool',
        sport: 'Football',
        league: 'EPL',
        team_a: 'Manchester United',
        team_b: 'Liverpool',
        start_time: new Date('2024-05-17T16:00:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Arsenal vs Chelsea',
        sport: 'Football',
        league: 'EPL',
        team_a: 'Arsenal',
        team_b: 'Chelsea',
        start_time: new Date('2024-05-18T14:30:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Barcelona vs Real Madrid',
        sport: 'Football',
        league: 'La Liga',
        team_a: 'Barcelona',
        team_b: 'Real Madrid',
        start_time: new Date('2024-05-19T20:00:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Novak Djokovic vs Rafael Nadal',
        sport: 'Tennis',
        league: 'Wimbledon',
        team_a: 'Novak Djokovic',
        team_b: 'Rafael Nadal',
        start_time: new Date('2024-05-20T13:00:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Roger Federer vs Andy Murray',
        sport: 'Tennis',
        league: 'US Open',
        team_a: 'Roger Federer',
        team_b: 'Andy Murray',
        start_time: new Date('2024-05-21T15:30:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Delhi Capitals vs Sunrisers Hyderabad',
        sport: 'Cricket',
        league: 'IPL',
        team_a: 'Delhi Capitals',
        team_b: 'Sunrisers Hyderabad',
        start_time: new Date('2024-05-22T19:30:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Paris Saint-Germain vs Bayern Munich',
        sport: 'Football',
        league: 'Champions League',
        team_a: 'Paris Saint-Germain',
        team_b: 'Bayern Munich',
        start_time: new Date('2024-05-23T20:00:00'),
        game_type: 'sports'
      },
      {
        game_name: 'Serena Williams vs Maria Sharapova',
        sport: 'Tennis',
        league: 'French Open',
        team_a: 'Serena Williams',
        team_b: 'Maria Sharapova',
        start_time: new Date('2024-05-24T12:00:00'),
        game_type: 'sports'
      }
    ];

    // Insert casino games
    const casinoGames = [
      {
        game_name: 'Book of Dead',
        provider: 'Play\'n GO',
        category: 'Slots',
        game_type: 'casino'
      },
      {
        game_name: 'Gates of Olympus',
        provider: 'Pragmatic Play',
        category: 'Slots',
        game_type: 'casino'
      },
      {
        game_name: 'Sweet Bonanza',
        provider: 'Pragmatic Play',
        category: 'Slots',
        game_type: 'casino'
      },
      {
        game_name: 'Lightning Roulette',
        provider: 'Evolution',
        category: 'Live Casino',
        game_type: 'casino'
      },
      {
        game_name: 'Blackjack Live',
        provider: 'Evolution',
        category: 'Live Casino',
        game_type: 'casino'
      },
      {
        game_name: 'Monopoly Live',
        provider: 'Evolution',
        category: 'Live Casino',
        game_type: 'casino'
      },
      {
        game_name: 'European Roulette',
        provider: 'Evolution',
        category: 'Table Games',
        game_type: 'casino'
      },
      {
        game_name: 'Starburst',
        provider: 'NetEnt',
        category: 'Slots',
        game_type: 'casino'
      },
      {
        game_name: 'Mega Fortune',
        provider: 'NetEnt',
        category: 'Slots',
        game_type: 'casino'
      },
      {
        game_name: 'Big Bass Bonanza',
        provider: 'Pragmatic Play',
        category: 'Slots',
        game_type: 'casino'
      }
    ];

    // Insert sports matches
    for (const match of sportsMatches) {
      await pool.query(
        `INSERT INTO games (game_name, sport, league, team_a, team_b, start_time, game_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [match.game_name, match.sport, match.league, match.team_a, match.team_b, match.start_time, match.game_type]
      );
    }

    // Insert casino games
    for (const game of casinoGames) {
      await pool.query(
        `INSERT INTO games (game_name, provider, category, game_type)
         VALUES ($1, $2, $3, $4)`,
        [game.game_name, game.provider, game.category, game.game_type]
      );
    }

    console.log(`Inserted ${sportsMatches.length} sports matches and ${casinoGames.length} casino games`);
    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;

