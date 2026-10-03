CREATE TABLE IF NOT EXISTS country_intelligence (
 code TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 content TEXT NOT NULL CHECK(json_valid(content)),
 updated_at INTEGER NOT NULL
);
