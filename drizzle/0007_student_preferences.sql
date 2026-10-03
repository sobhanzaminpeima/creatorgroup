CREATE TABLE IF NOT EXISTS student_preferences (
 student_id TEXT PRIMARY KEY NOT NULL REFERENCES student_accounts(id),
 preferences TEXT NOT NULL DEFAULT '{}',
 profile TEXT NOT NULL DEFAULT '{}',
 updated_at INTEGER NOT NULL
);
