import { ErrorCode } from '../types/error.types.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, ErrorCode.VALIDATION_ERROR, message);
    this.name = 'ValidationError';
  }
}

export class InvalidFilterError extends AppError {
  constructor(filterName: string, available: string[]) {
    super(
      400,
      ErrorCode.INVALID_FILTER,
      `Unknown filter: '${filterName}'. Available: ${available.join(', ')}`,
    );
    this.name = 'InvalidFilterError';
  }
}

export class GraphLoadError extends AppError {
  constructor(message: string) {
    super(500, ErrorCode.GRAPH_LOAD_FAILED, message);
    this.name = 'GraphLoadError';
  }
}
