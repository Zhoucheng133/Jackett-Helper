import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";
import { nanoid } from "nanoid";
import bcrypt from 'bcrypt';

const saltRounds=10;

export class Auth {
  // 【通用】检查header登录状态
  // 【GET】检查JWT是否合法 (header: token)
  async headerCheck(headers: any, jwt: any): Promise<ResponseBody>{
    if (!headers || !headers.token) {
      return ToResponseBody(false, "参数不正确");
    }
    const profile = await jwt.verify(headers.token);
    if (profile.username) {
      return ToResponseBody(true, "")
    } else {
      return ToResponseBody(false, "无效令牌")
    }
  }

  // 【GET】检查是否需要先注册账户 (true -> 需要)
  checkInit(db: Database): ResponseBody{
    const rowCount = db
      .prepare("SELECT COUNT(*) AS count FROM user")
      .get() as { count: number };
    return ToResponseBody(true, rowCount.count === 0);
  }

  // 【POST】注册 (body: username & password)
  register(body: any, db: Database): ResponseBody{
    const rowCount = db
      .prepare("SELECT COUNT(*) AS count FROM user")
      .get() as { count: number };
    if(rowCount.count != 0){
      return ToResponseBody(false, "用户已存在")
    }
    if (!body || !body.username || !body.password) {
      return ToResponseBody(false, "参数不正确");
    }
    const { username, password } = body;
    try {
      const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username);
      if (existingUser) {
        return ToResponseBody(false, "用户名已存在");
      }
      const id=nanoid();
      db.prepare("INSERT INTO user (id, username, password) VALUES (?, ?, ?)")
        .run(id, username, bcrypt.hashSync(password, saltRounds));
      return ToResponseBody(true, "");
    } catch (error) {
      return ToResponseBody(false, error)
    }
  }

  // 【POST】登录 (body: username & password)
  async login(body: any, db: Database, jwt: any): Promise<ResponseBody>{
    if (!body || !body.username || !body.password) {
      return ToResponseBody(false, "参数不正确");
    }
    const { username, password } = body;
    const data = db.prepare("SELECT password FROM user WHERE username = ?").get(username) as any;
    if(!data){
      return ToResponseBody(false, "用户名或密码不正确");
    }else if(bcrypt.compareSync(password, data.password)){
      const token=await jwt.sign({ username });
      return ToResponseBody(true, token)
    }
    return ToResponseBody(false, "用户名或密码不正确");
  }
}