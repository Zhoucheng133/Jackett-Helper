import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import jwt from "@elysiajs/jwt";
import { nanoid } from "nanoid";
import { Auth } from "./utils/auth";
import Database from "bun:sqlite";
import { initDB } from "./utils/static";
import { List } from "./utils/list";
import { Aria } from "./utils/aria";
import { Handler } from "./utils/handler";

const auth=new Auth();
const list=new List();
const aria=new Aria();
const handler=new Handler();

const db = new Database('db/database.db');
initDB(db);

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
.get("/api/init", () => auth.checkInit(db))
.get("/api/auth", ({headers, jwt}) => auth.headerCheck(headers, jwt))
.post("/api/register", ({ body }) => auth.register(body, db))
.post("/api/login", ({ body, jwt }) => auth.login(body, db, jwt))

.post("/api/list/add", ({ body }) => list.add(body, db))
.delete("/api/list/del/:id", ({ params: { id } }) => list.del(id, db))
.post("/api/list/edit/:id", ({ params: { id }, body }) => list.edit(id, body, db))
.get("/api/list/get", () => list.get(db))

.post("/api/aria/config", ({ body }) => aria.config(body, db))
.get("/api/aria/get", () => aria.get(db))

.get("/api/handler/all/:id", ({ params: { id } }) => handler.getAllFromId(id, db))
.get("/api/handler/search/:id", ({ params: { id }, query }) => handler.searchById(id, db, query))

.listen(3000);


console.log(`🦊 Elysia is running at http://127.0.0.1:${app.server?.port}`);
