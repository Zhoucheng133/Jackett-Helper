import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import { ListItem } from "./list";
import axios from "axios";
import xml2js  from "xml2js";

interface HandlerItem{
  title: string,
  torrent: string,
  magnet: string,
  pubDate: string,
}

export class Handler{
  async getAllFromId(id: string, db: Database): Promise<ResponseBody>{
    const data: ListItem=db.prepare(`SELECT url, key FROM list WHERE id = ?`).get(id) as ListItem;
    if(data){
      const url=`${data.url}?apikey=${data.key}`;
      const {data: response}=await axios.get(url);

      try {
        const parser = new xml2js.Parser();
        const result = await new Promise<any>((resolve, reject) => {
          parser.parseString(response, (err, result) => {
            if (err) {
              reject({
                ok: false,
                msg: '解析rss失败'
              });
            } else {
              resolve(result);
            }
          });
        });
        const items = result.rss.channel[0].item;
        let list: HandlerItem[]=[];
        for (const element of items) {
          list.push({
            title: element.title,
            pubDate: element.pubDate,
            torrent: element.guid,
            magnet: element['torznab:attr'][5]['$'].value,
          })
        }
        return ToResponseBody(true, list);
      } catch (error) {
        return ToResponseBody(false, error);
      }
    }else{
      return ToResponseBody(false, "指定id不存在")
    }
  }
}