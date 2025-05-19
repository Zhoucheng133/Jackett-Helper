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