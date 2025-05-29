import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import { nanoid } from "nanoid";

export interface ListItem{
  id?: string,
  name: string,
  url: string,
  key: string
}

export class List{

  constructor(private db: Database){}

  // 【POST】添加一个项 (body -> ListItem[])
  add(body: any): ResponseBody{
    if(!Array.isArray(body)){
      return ToResponseBody(false, "参数不正确");
    }
    try {
      if(body.length==0){ 
        return ToResponseBody(false, "参数不正确")
      }
      const data: ListItem[]=body as ListItem[];
      for (const element of data) {
        if(element.key && element.url ){
          const existingItem = this.db.prepare("SELECT * FROM list WHERE url = ?").get(element.url);
          if (existingItem) {
            return ToResponseBody(false, "已存在的项目");
          }
        }else{
          return ToResponseBody(false, "参数不正确")
        }
      }
      data.forEach((item: ListItem)=>{
        const id=nanoid();
        this.db.prepare("INSERT INTO list (id, url, name, key) VALUES (?, ?, ?, ?)")
          .run(id, item.url, item.name, item.key);
      })
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }

  // 【DELETE】删除一个项 (/:id)
  del(id: string): ResponseBody{
    const existingItem = this.db.prepare("SELECT * FROM list WHERE id = ?").get(id);
    if (!existingItem) {
      return ToResponseBody(false, "不存在的项");
    }
    try {
      this.db.prepare(`DELETE FROM list WHERE id = ?`).run(id);
    } catch (error) {
      return ToResponseBody(false, error);
    }
    return ToResponseBody(true, "");
  }

  // 【POST】编辑一个项 (body -> ListItem)
  edit(id: string, body: any): ResponseBody{
    const existingItem = this.db.prepare("SELECT * FROM list WHERE id = ?").get(id);
    if (!existingItem) {
      return ToResponseBody(false, "不存在的项");
    }
    body=body as ListItem
    try {
      if(body.key && body.url && body.name){
        this.db.prepare(`UPDATE list SET url = ?, name = ?, key = ? WHERE id = ?`).run(body.url, body.name, body.key, id);
      }else{
        return ToResponseBody(false, "参数不正确")
      }
    } catch (error) {
      return ToResponseBody(false, error);
    }
    return ToResponseBody(true, "");
  }

  // 【GET】获取所有列表
  get(): ResponseBody{
    try {
      const list=this.db.prepare(`SELECT * FROM list`).all() as ListItem[];
      return ToResponseBody(true, list);
    } catch (error) {
      return ToResponseBody(false, error);
    }
  }
}