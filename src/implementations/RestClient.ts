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
      const t0 = Date.now();
      const reqConfig: AxiosRequestConfig = {
        method,
        url: request.url,
        headers: request.headers,
        data: method == "POST" || method == "PUT" ? request.data : undefined,
        timeout: request.timeout,
        responseType: "json",
      };
      let msg =
        "Invoking " +
        reqConfig.url +
        "\n   Method: " +
        reqConfig.method +
        "\n  Timeout: " +
        reqConfig.timeout;
      if (reqConfig.headers) {
        let headers = JSON.stringify(reqConfig.headers);
        if (headers.length > 300) {
          headers =
            headers.substring(0, 300) +
            "... (" +
            (headers.length - 300) +
            " more)";
        }
        msg += "\n  Headers: " + headers;
      }
      if (reqConfig.data) {
        let body = JSON.stringify(reqConfig.data);
        if (body.length > 300) {
          body =
            body.substring(0, 300) + "... (" + (body.length - 300) + " more)";
        }
        msg += "\n     Body: " + body;
      }

      LoggerMain.info(msg);
      axios(reqConfig)
        .then((response) => {
          let msg =
            "Response from " +
            request.url +
            "\n     Time: " +
            (Date.now() - t0) +
            "ms" +
            "\n   Status: " +
            response.status;
          if (response.headers) {
            let headers = JSON.stringify(response.headers);
            if (headers.length > 300) {
              headers =
                headers.substring(0, 300) +
                "... (" +
                (headers.length - 300) +
                " more)";
            }
            msg += "\n  Headers: " + headers;
          }
          if (response.data) {
            let body = JSON.stringify(response.data);
            if (body.length > 300) {
              body =
                body.substring(0, 300) +
                "... (" +
                (body.length - 300) +
                " more)";
            }
            msg += "\n     Body: " + body;
          }
          LoggerMain.info(msg);
          resolve({
            status: response.status,
            headers: JSON.parse(JSON.stringify(response.headers)),
            data: JsonUtils.parse<T>(JSON.stringify(response.data)),
          });
        })
        .catch((err: any) => {
          LoggerMain.error(
            "Error invoking " +
              request.url +
              " after " +
              (Date.now() - t0) +
              "ms",
            err
          );
          reject(err);
        });
    });
  }
}
