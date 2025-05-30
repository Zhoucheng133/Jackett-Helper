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
  size: number,
}

interface SearchQuery{
  q?: string,
}

export class Handler{

  constructor(private db: Database){}

  // 【GET】获取某个id的所有项
  async getAllFromId(id: string): Promise<ResponseBody>{
    const data: ListItem=this.db.prepare(`SELECT url, key, name FROM list WHERE id = ?`).get(id) as ListItem;
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
            title: element.title[0],
            pubDate: element.pubDate[0],
            torrent: element.guid[0],
            magnet: element['torznab:attr'][5]['$'].value,
            size: parseInt(element.size[0])
          })
        }
        return ToResponseBody(true, {
          name: data.name,
          data: list
        });
      } catch (error) {
        return ToResponseBody(false, error);
      }
    }
    return ToResponseBody(false, "指定id不存在")
  }

  // 【GET】在某个id中搜索某个关键词
  async searchById(id: string, query: SearchQuery): Promise<ResponseBody>{
    if(!query.q){
      return ToResponseBody(false, "参数不正确");
    }
    const data: ListItem=this.db.prepare(`SELECT url, key, name FROM list WHERE id = ?`).get(id) as ListItem;
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
            title: element.title[0],
            pubDate: element.pubDate[0],
            torrent: element.guid[0],
            magnet: element['torznab:attr'][5]['$'].value,
            size: parseInt(element.size[0])
          })
        }
        return ToResponseBody(true, {
          name: data.name,
          data: list
        });
      } catch (error) {
        return ToResponseBody(false, error);
      }
    }
    return ToResponseBody(false, "指定id不存在")
  }

  getNameFromId(id: string): ResponseBody{
    try {
      const data=this.db.prepare(`SELECT name FROM list WHERE id = ?`).get(id) as ListItem;
      if(data.name){
        return ToResponseBody(true, data.name);
      }
      return ToResponseBody(false, "指定id不存在");
    } catch (error) {
      return ToResponseBody(false, "指定id不存在");
    }
  }
}