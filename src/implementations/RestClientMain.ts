import {
  HttpMethod,
  JsonUtils,
  RestClientRequest,
  RestClientResponse
} from '@tser-framework/commons';
import axios, { AxiosRequestConfig } from 'axios';

import { LoggerMain } from './LoggerMain';

export class RestClientMain {
  private static LOGGER = new LoggerMain('RestClientMain');

  private constructor() {}

  public static invoke<T>(request: RestClientRequest<T>): Promise<RestClientResponse<T>> {
    return new Promise<RestClientResponse<T>>((resolve, reject) => {
      const t0 = Date.now();
      const reqConfig: AxiosRequestConfig = {
        method: HttpMethod[request.method],
        url: request.url,
        headers: request.headers,
        data:
          request.method == HttpMethod.POST || request.method == HttpMethod.PUT
            ? request.data
            : undefined,
        timeout: request.timeout,
        responseType: 'json'
      };
      let msg =
        'Invoking ' +
        reqConfig.url +
        '\n   Method: ' +
        reqConfig.method +
        '\n  Timeout: ' +
        reqConfig.timeout;
      if (reqConfig.headers) {
        let headers = JSON.stringify(reqConfig.headers);
        if (headers.length > 300) {
          headers = headers.substring(0, 300) + '... (' + (headers.length - 300) + ' more)';
        }
        msg += '\n  Headers: ' + headers;
      }
      if (reqConfig.data) {
        let body = JSON.stringify(reqConfig.data);
        if (body.length > 300) {
          body = body.substring(0, 300) + '... (' + (body.length - 300) + ' more)';
        }
        msg += '\n     Body: ' + body;
      }

      RestClientMain.LOGGER.info(msg);
      axios(reqConfig)
        .then((response) => {
          resolve(RestClientMain.dealResponse(t0, request, response));
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) => {
          if (err.response && err.response.status) {
            resolve(RestClientMain.dealResponse(t0, request, err.response));
          } else {
            RestClientMain.LOGGER.error(
              'Error invoking ' + request.url + ' after ' + (Date.now() - t0) + 'ms',
              err
            );
            reject(err);
          }
        });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static dealResponse<T>(
    t0: number,
    request: RestClientRequest<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any
  ): RestClientResponse<T> {
    let msg =
      'Response from ' +
      request.url +
      '\n     Time: ' +
      (Date.now() - t0) +
      ' ms' +
      '\n   Status: ' +
      response.status +
      ' - ' +
      response.statusText;
    if (response.headers) {
      let headers = JSON.stringify(response.headers);
      if (headers.length > 300) {
        headers = headers.substring(0, 300) + '... (' + (headers.length - 300) + ' more)';
      }
      msg += '\n  Headers: ' + headers;
    }
    if (response.data) {
      let body = JSON.stringify(response.data);
      if (body.length > 300) {
        body = body.substring(0, 300) + '... (' + (body.length - 300) + ' more)';
      }
      msg += '\n     Body: ' + body;
    }
    RestClientMain.LOGGER.info(msg);
    return {
      status: response.status,
      headers: JSON.parse(JSON.stringify(response.headers)),
      data: JsonUtils.parse<T>(JSON.stringify(response.data))
    };
  }
}
