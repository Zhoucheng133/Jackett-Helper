import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";

interface AriaItem{
  url: string,
  secret: string
}

export class Aria{

  ariaConfig: AriaItem={
    url: "",
    secret: "",
  }

  constructor(db: Database){
    try {
      const data=db.prepare(`SELECT * FROM aria`).get() as AriaItem;
      this.ariaConfig={
        url: data.url,
        secret: data.secret,
      };
    } catch (_){}
  }

  // 【POST】配置Aria (body -> AriaItem)
  config(body: any, db: Database): ResponseBody{
    if(!body || !body.url || !body.secret){
      return ToResponseBody(false, "参数不正确")
    }
    try {
      const data=body as AriaItem;
      db.prepare(`REPLACE INTO aria (id, url, secret) VALUES (1, ?, ?)`).run(data.url, data.secret);
      this.ariaConfig={
        url: body.url,
        secret: body.secret,
      }
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }

  // 【GET】获取Aria配置
  get(): ResponseBody{
    return {
      ok: true,
      msg: this.ariaConfig,
    }
  }
}