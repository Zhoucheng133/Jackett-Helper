export interface ResponseBody{
  ok: boolean,
  msg: string,
}

export const ToResponseBody=(ok: boolean, msg: string): ResponseBody=>{
  return {ok, msg};
}