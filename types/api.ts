export interface ApiError {
  message: string;
  code: string;
}

export class ApiRequestError extends Error {
  code: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
  }
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}
