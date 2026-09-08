const { Pool } = require('pg');

// Prefer explicit PostgreSQL connection fields in Docker. This avoids URL
// parsing problems when passwords contain characters such as @, :, / or #.
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error('DATABASE_URL or PGHOST environment variable is required');
}

const poolConfig = process.env.PGHOST
  ? {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    }
  : { connectionString: process.env.DATABASE_URL };

const pool = new Pool({
  ...poolConfig,
  max: Number(process.env.DB_POOL_MAX || 20),
  min: Number(process.env.DB_POOL_MIN || 2),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 15000),
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 15000),
  application_name: process.env.DB_APPLICATION_NAME || 'nabha-telemedicine-backend'
});

pool.on('error', error => console.error('Unexpected PostgreSQL pool error:', error));

async function query(text, params = []) { return pool.query(text, params); }
async function getClient() { return pool.connect(); }

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) { console.error('Transaction rollback failed:', rollbackError); }
    throw error;
  } finally { client.release(); }
}

async function checkHealth() {
  const result = await pool.query('SELECT 1 AS healthy');
  return result.rows[0]?.healthy === 1;
}

async function close() { await pool.end(); }

module.exports = { pool, query, getClient, transaction, checkHealth, close };
