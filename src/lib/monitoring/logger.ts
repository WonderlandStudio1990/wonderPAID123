import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  },
});

export const monitoringLogger = logger.child({ module: 'monitoring' });
export const moniteLogger = logger.child({ module: 'monite' });
export const dbLogger = logger.child({ module: 'database' });

export default logger; 