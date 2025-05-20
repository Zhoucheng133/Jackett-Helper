import Database from "bun:sqlite";

export interface ResponseBody{
  ok: boolean,
  msg: any,
}

export function ToResponseBody(ok: boolean, msg: any): ResponseBody{
  return {ok, msg};
}

export function initDB(db: Database){
  initUserDB(db);
  initListDB(db);
  initAriaDB(db);
}

function initUserDB(db: Database){
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      username TEXT,
      password TEXT
    )
  `).run()
}

function initListDB(db: Database){
  db.prepare(`
    CREATE TABLE IF NOT EXISTS list (
      id TEXT PRIMARY KEY,
      url TEXT,
      key TEXT
    )
  `).run()
}

function initAriaDB(db: Database){
  db.prepare(`
    CREATE TABLE IF NOT EXISTS aria (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      url TEXT,
      secret TEXT
    )
  `).run()
}