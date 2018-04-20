-- Up
ALTER TABLE user ADD profile_image_url CHAR(1024);

-- Down
BEGIN TRANSACTION;
CREATE TEMPORARY TABLE user_backup(
    id INTEGER PRIMARY KEY NOT NULL,
    name CHAR(128),
    display_name CHAR(128),
    provider CHAR(128),
    provider_id CHAR(128),
    created_at TEXT NOT NULL,
    blocked BOOLEAN,
    trusted BOOLEAN
);

INSERT INTO user_backup SELECT id, name, display_name, provider, provider_id, created_at, blocked, trusted FROM user;
DROP TABLE user;
CREATE TABLE user(
    id INTEGER PRIMARY KEY NOT NULL,
    name CHAR(128),
    display_name CHAR(128),
    provider CHAR(128),
    provider_id CHAR(128),
    created_at TEXT NOT NULL,
    blocked BOOLEAN,
    trusted BOOLEAN
);
INSERT INTO user SELECT id, name, display_name, provider, provider_id, created_at, blocked, trusted FROM user_backup;
DROP TABLE user_backup;
COMMIT;

