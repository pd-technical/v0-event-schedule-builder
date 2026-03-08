import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "picnicDay.sqlite");

const db: Database.Database= new Database(dbPath);

export default db;