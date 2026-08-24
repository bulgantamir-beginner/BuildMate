const { Pool } = require("pg");
require("dotenv").config();

const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 25,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "pc_builder",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "1234",
        max: 25,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

module.exports = pool;