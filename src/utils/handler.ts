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

interface SearchQuery{
  q?: string,
}

export class Handler{
  // 【GET】获取某个id的所有项
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
    }
    return ToResponseBody(false, "指定id不存在")
  }

  // 【GET】在某个id中搜索某个关键词
  async searchById(id: string, db: Database, query: SearchQuery): Promise<ResponseBody>{
    if(!query.q){
      return ToResponseBody(false, "参数不正确");
    }
    const data: ListItem=db.prepare(`SELECT url, key FROM list WHERE id = ?`).get(id) as ListItem;
    if(data){
      const url=`${data.url}?apikey=${data.key}&t=search&q=${query.q}`;
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
    }
    return ToResponseBody(false, "指定id不存在")
  }
}