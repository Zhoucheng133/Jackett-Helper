import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";

interface AriaItem{
  url: string,
  secret: string
}

export class Aria{
  // 【POST】配置Aria (body -> AriaItem)
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

  get(db: Database): ResponseBody{
    try {
      const data=db.prepare(`SELECT * FROM aria`).get() as AriaItem;
      return ToResponseBody(true, data);
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }
}