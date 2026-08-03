const { Pool } = require('pg');

// En producción (Vercel + Neon/Supabase/Railway) se usa DATABASE_URL con SSL.
// En local se sigue usando la conexión por variables sueltas sin SSL.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

module.exports = { query, getClient };
