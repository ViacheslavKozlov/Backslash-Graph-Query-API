import { buildApp } from './app.js';
import { config } from './config/index.js';
import { loggerConfigDev } from './config/logger.js';

async function main() {
  const app = await buildApp({
    logger: loggerConfigDev,
  });

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://localhost:${String(config.port)}`);
    console.log(`Swagger docs at http://localhost:${String(config.port)}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
