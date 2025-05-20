import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import { nanoid } from "nanoid";

interface ListItem{
  url: string,
  key: string
}

export class List{
  add(body: any, db: Database): ResponseBody{
    if (!body || !body.data) {
      return ToResponseBody(false, "参数不正确");
    }

    try {
      const data: ListItem[]=body.data as ListItem[];
      for (const element of data) {
        if(element.key && element.url ){
          const existingItem = db.prepare("SELECT * FROM list WHERE url = ?").get(element.url);
          if (existingItem) {
            return ToResponseBody(false, "已存在的项目");
          }
        }else{
          return ToResponseBody(false, "参数不正确")
        }
      }
      data.forEach((item: ListItem)=>{
        const id=nanoid();
        db.prepare("INSERT INTO list (id, url, key) VALUES (?, ?, ?)")
          .run(id, item.url, item.key);
      })
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }

  del(id: string, db: Database): ResponseBody{
    const existingItem = db.prepare("SELECT * FROM list WHERE id = ?").get(id);
    if (!existingItem) {
      return ToResponseBody(false, "不存在的项");
    }
    try {
      db.prepare(`DELETE FROM list WHERE id = ?`).run(id);
    } catch (error) {
      return ToResponseBody(false, error);
    }
    return ToResponseBody(true, "");
  }

  edit(id: string, body: any, db: Database): ResponseBody{
    if (!body || !body.data) {
      return ToResponseBody(false, "参数不正确");
    }
    const existingItem = db.prepare("SELECT * FROM list WHERE id = ?").get(id);
    if (!existingItem) {
      return ToResponseBody(false, "不存在的项");
    }

    try {
      const data=body.data as ListItem;
      if(data.key && data.url){
        db.prepare(`UPDATE list SET url = ?, key = ? WHERE id = ?`).run(data.url, data.key, id);
      }else{
        return ToResponseBody(false, "参数不正确")
      }
    } catch (error) {
      return ToResponseBody(false, error);
    }
    return ToResponseBody(true, "");
  }
}