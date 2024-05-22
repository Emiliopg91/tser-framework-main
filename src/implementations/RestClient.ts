import axios, { AxiosRequestConfig } from "axios";
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
      const reqConfig: AxiosRequestConfig = {
        method,
        url: request.url,
        headers: request.headers,
        data: method == "POST" || method == "PUT" ? request.data : undefined,
        timeout: request.timeout,
        responseType: "json",
      };
      LoggerMain.info(
        "Invoking " +
          reqConfig.url +
          "\\n  Method: " +
          reqConfig.method +
          "\\n  Headers: " +
          JSON.stringify(reqConfig.headers) +
          "\\n  Body: " +
          JSON.stringify(reqConfig.data) +
          "\\n  Timeout: " +
          reqConfig.timeout
      );
      axios(reqConfig)
        .then((response) => {
          LoggerMain.info(
            "Response from " +
              request.url +
              "\\n  Status" +
              response.status +
              "\\n  Headers: " +
              JSON.stringify(response.headers) +
              "\\n  Body: " +
              JSON.stringify(response.data)
          );
          resolve({
            status: response.status,
            headers: JSON.parse(JSON.stringify(response.headers)),
            data: JsonUtils.parse<T>(JSON.stringify(response.data)),
          });
        })
        .catch((err: any) => {
          LoggerMain.error("Error invoking " + request.url, err);
          reject(err);
        });
    });
  }
}
