import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";

interface AriaItem{
  url: string,
  secret: string
}

export class Aria{
  config(body: any, db: Database): ResponseBody{
    if(!body || !body.url || !body.secret){
      return ToResponseBody(false, "参数不正确")
    }

    try {
      const data=body as AriaItem;
      db.prepare(`REPLACE INTO aria (id, url, secret) VALUES (1, ?, ?)`).run(data.url, data.secret);
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }
}