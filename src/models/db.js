import pkg from 'pg';
const { Pool } = pkg;

let pool;

const dbConnection = async () => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

export default dbConnection;
