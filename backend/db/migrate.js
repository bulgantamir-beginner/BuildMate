const pool = require("./pool");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS parts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category    VARCHAR(50)  NOT NULL,
        name        VARCHAR(255) NOT NULL,
        brand       VARCHAR(100) NOT NULL,
        tier        VARCHAR(50)  NOT NULL DEFAULT 'mid-range',
        price       NUMERIC(10,2) NOT NULL DEFAULT 0,
        image_url   TEXT,
        specs       JSONB        NOT NULL DEFAULT '{}',
        extra       JSONB        NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS builds (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(255) NOT NULL,
        description         TEXT         DEFAULT '',
        parts               JSONB        NOT NULL DEFAULT '{}',
        compatibility_score INTEGER      DEFAULT 0,
        is_compatible       BOOLEAN      DEFAULT false,
        total_price         NUMERIC(10,2) DEFAULT 0,
        created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_chats (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(100) NOT NULL,
        role       VARCHAR(20)  NOT NULL,
        content    TEXT         NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ai_chats_session ON ai_chats(session_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username     VARCHAR(100) UNIQUE NOT NULL,
        password     VARCHAR(255) NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO admins (username, password) VALUES ('admin', 'admin123')
      ON CONFLICT (username) DO NOTHING;
    `);

    console.log("✅ All tables created successfully");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
