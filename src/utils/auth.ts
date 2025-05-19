import Database from "bun:sqlite";
import { ResponseBody, ToResponseBody } from "./static";

const saltRounds=10;

export class Auth {
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

  checkInit(db: Database): ResponseBody {
    const rowCount = db
      .prepare("SELECT COUNT(*) AS count FROM user")
      .get() as { count: number };
    return ToResponseBody(true, rowCount.count === 0);
  }
}