-- Enable dblink extension first
CREATE EXTENSION IF NOT EXISTS dblink;

-- create databases for services (if not exists patterns vary by engine)
-- postgres does not support IF NOT EXISTS for CREATE DATABASE; use DO block
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'profile_db') THEN
      PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE profile_db');
   END IF;
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'planning_db') THEN
      PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE planning_db');
   END IF;
END
$$;


