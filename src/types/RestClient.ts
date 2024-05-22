export interface RestClientRequest<T> {
  url: string;
  headers: Record<string, string>;
  data?: T;
  timeout?: number;
}

export interface RestClientResponse<T> {
  status: number;
  headers: Record<string, string>;
  data: T;
}
