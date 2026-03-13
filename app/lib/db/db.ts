import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), process.env.DB_PATH || "volumes/database.sqlite3");

const db: Database.Database= new Database(dbPath);

// Initialize the database if needed
db.exec(`
	CREATE TABLE IF NOT EXISTS locations (
	  id TEXT PRIMARY KEY,
	  name TEXT UNIQUE,
	  address TEXT,
	  latitude REAL,
	  longitude REAL
	);

	CREATE TABLE IF NOT EXISTS events (
	  id TEXT PRIMARY KEY,
	  location_id TEXT,
	  name TEXT,
	  description TEXT,
	  start_time TEXT,
	  end_time TEXT,
	  category TEXT,
	  popularity INTEGER,
	  location_detail TEXT,
	  showtime TEXT,
	  FOREIGN KEY (location_id) REFERENCES locations(id)
	);

	CREATE TABLE IF NOT EXISTS tags (
	  id TEXT PRIMARY KEY,
	  name TEXT UNIQUE
	);

	CREATE TABLE IF NOT EXISTS event_tags (
	  event_id TEXT,
	  tag_id TEXT,
	  PRIMARY KEY (event_id, tag_id),
	  FOREIGN KEY (event_id) REFERENCES events(id),
	  FOREIGN KEY (tag_id) REFERENCES tags(id)
	);
`);

console.log("Database initialized");

export default db;