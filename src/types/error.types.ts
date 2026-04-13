export enum ErrorCode {
  INVALID_FILTER = 'INVALID_FILTER',
  GRAPH_LOAD_FAILED = 'GRAPH_LOAD_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
}
