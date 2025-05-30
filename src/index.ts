import { Elysia, file } from "elysia";
import { cors } from '@elysiajs/cors'
import jwt from "@elysiajs/jwt";
import { nanoid } from "nanoid";
import { Auth } from "./utils/auth";
import Database from "bun:sqlite";
import { initDB } from "./utils/static";
import { List } from "./utils/list";
import { Aria } from "./utils/aria";
import { Handler } from "./utils/handler";

const db = new Database('db/database.db');
initDB(db);
const auth=new Auth(db);
const list=new List(db);
const aria=new Aria(db);
const handler=new Handler(db);

// 在生产模式下使用nanoid随机生成jwt密钥
// const JWT_SECRET = nanoid();
const JWT_SECRET='connector';

const app=new Elysia()
.use(cors())
.use(jwt({secret: JWT_SECRET, exp: "1y"}))

.onBeforeHandle(async ({path, headers, jwt})=>{
  if(path.startsWith("/api")){
    switch (path) {
      case "/api/init":
      case "/api/register":
      case "/api/login":
      case "/api/auth":
        break;
    
      default:
        const authResponse=await auth.headerCheck(headers, jwt);
        if(!authResponse.ok){
          return authResponse;
        }
    }
  }
})
.get("/api/init", () => auth.checkInit())
.get("/api/auth", ({headers, jwt}) => auth.headerCheck(headers, jwt))
.post("/api/register", ({ body }) => auth.register(body))
.post("/api/login", ({ body, jwt }) => auth.login(body, jwt))

.post("/api/list/add", ({ body }) => list.add(body))
.delete("/api/list/del/:id", ({ params: { id } }) => list.del(id))
.post("/api/list/edit/:id", ({ params: { id }, body }) => list.edit(id, body))
.get("/api/list/get", () => list.get())

.post("/api/aria/config", ({ body }) => aria.config(body))
.get("/api/aria/get", () => aria.get())
.post("/api/aria/download", ({ body }) => aria.download(body))

.get("/api/handler/all/:id", ({ params: { id } }) => handler.getAllFromId(id))
.get("/api/handler/search/:id", ({ params: { id }, query }) => handler.searchById(id, query))
.get("/api/handler/nameFromId/:id", ({ params: {id} }) => handler.getNameFromId(id))

.get("/assets/:name", ({ params })=>file(`web/assets/${params.name.replaceAll("./", "")}`))
.get("/icon.svg", ()=>file(`web/icon.svg`))
.get("/*", ()=>file("web/index.html"))

.listen(3000);


console.log(`🦊 Elysia is running at http://127.0.0.1:${app.server?.port}`);
