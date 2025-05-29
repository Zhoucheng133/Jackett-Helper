import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import axios from "axios";

interface AriaItem{
  url: string,
  secret: string
}

export class Aria{

  ariaConfig: AriaItem={
    url: "",
    secret: "",
  }

  constructor(private db: Database){
    try {
      const data=this.db.prepare(`SELECT * FROM aria`).get() as AriaItem;
      this.ariaConfig={
        url: data.url,
        secret: data.secret,
      };
    } catch (_){}
  }

  // 【POST】配置Aria (body -> AriaItem)
  config(body: any): ResponseBody{
    if(!body || !body.url || !body.secret){
      return ToResponseBody(false, "参数不正确")
    }
    try {
      const data=body as AriaItem;
      this.db.prepare(`REPLACE INTO aria (id, url, secret) VALUES (1, ?, ?)`).run(data.url, data.secret);
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

  // 【POST】添加下载任务
  async download(body: any): Promise<ResponseBody>{
    if(!body || !body.url){
      return ToResponseBody(false, "参数不正确");
    }else if(this.ariaConfig.url.length==0 || this.ariaConfig.secret.length==0){
      return ToResponseBody(false, "没有配置Aria");
    }
    const url=body.url;
    try {
      await axios.post(
        this.ariaConfig.url,
        {
          "jsonrpc": "2.0",
          "method": "aria2.addUri",
          "id": 1,
          "params": [
            `token:${this.ariaConfig.secret}`,
            [url],
            {}
          ],
        }
      );
    } catch (error) {
      return ToResponseBody(false, error);
    }

    return ToResponseBody(true, "");
  }
}