import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

const dbConnection = async () => {
  // Return existing pool if already created
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    });

    // Test connection
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit process, just log the error
      pool = null; // Reset pool so it can be recreated
    });

    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    pool = null; // Reset pool on error
    throw error;
  }
};

// Export function to get pool directly
export const getPool = () => pool;

export default dbConnection;
