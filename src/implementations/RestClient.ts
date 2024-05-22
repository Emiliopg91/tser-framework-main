import axios from "axios";
import { RestClientRequest, RestClientResponse } from "../types/RestClient";
import { LoggerMain } from "./LoggerMain";
import { JsonUtils } from "@tser-framework/commons";

export class RestClient {
  private constructor() {}

  public static get<T>(
    request: RestClientRequest<T>
  ): Promise<RestClientResponse<T>> {
    return RestClient.invoke("GET", request);
  }

  private static invoke<T>(
    method: "GET" | "PUT" | "POST" | "DELETE",
    request: RestClientRequest<T>
  ): Promise<RestClientResponse<T>> {
    return new Promise<RestClientResponse<T>>((resolve, reject) => {
      axios({
        method,
        url: request.url,
        headers: request.headers,
        data: method == "POST" || method == "PUT" ? request.data : undefined,
        timeout: request.timeout,
        responseType: "json",
      })
        .then((response) => {
          resolve({
            status: response.status,
            headers: JSON.parse(JSON.stringify(response.headers)),
            data: JsonUtils.parse<T>(JSON.stringify(response.data)),
          });
        })
        .catch((err: any) => {
          LoggerMain.error("Error while invocation", err);
          reject(err);
        });
    });
  }
}
