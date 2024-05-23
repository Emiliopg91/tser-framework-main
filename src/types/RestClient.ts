export interface RestClientRequest<T> {
  url: string;
  timeout: number;
  headers?: Record<string, string>;
  data?: T;
}

export interface RestClientResponse<T> {
  status: number;
  headers?: Record<string, string>;
  data?: T;
}
