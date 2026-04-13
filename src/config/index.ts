import path from 'node:path';

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  dataFilePath:
    process.env.DATA_FILE_PATH || path.resolve(process.cwd(), 'data/train-ticket-be.json'),
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;
