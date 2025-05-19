import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import jwt from "@elysiajs/jwt";
import { nanoid } from "nanoid";
import { Auth } from "./utils/auth";
import Database from "bun:sqlite";
import { initDB } from "./utils/static";

const auth=new Auth();

const db = new Database('db/database.db');
initDB(db);

// 在生产模式下使用nanoid随机生成jwt密钥
const JWT_SECRET = nanoid();
// const JWT_SECRET='connector';

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

.listen(3000);


console.log(`🦊 Elysia is running at http://127.0.0.1:${app.server?.port}`);
