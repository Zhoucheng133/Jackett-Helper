import { ResponseBody, ToResponseBody } from "./static";

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
}