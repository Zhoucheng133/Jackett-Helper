import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import { nanoid } from "nanoid";

export class List{
  add(body: any, db: Database): ResponseBody{
    if (!body || !body.data) {
      return ToResponseBody(false, "参数不正确");
    }

    try {
      const data: string[]=body.data as string[];
      data.forEach((element: string) => {
        const existingItem = db.prepare("SELECT * FROM list WHERE url = ?").get(element);
        if (existingItem) {
          return ToResponseBody(false, "已存在的项目");
        }
      });
      data.forEach((item: string)=>{
        const id=nanoid();
        db.prepare("INSERT INTO list (id, url) VALUES (?, ?)")
          .run(id, item);
      })
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }

  del(id: string, db: Database): ResponseBody{
    try {
      db.prepare(`DELETE FROM list WHERE id = ?`).run(id);
    } catch (error) {
      return ToResponseBody(false, error);
    }
    return ToResponseBody(true, "");
  }
}