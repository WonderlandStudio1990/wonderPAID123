import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard'
    }
  }
});

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: object) {
    logger.info({ context: this.context, ...data }, message);
  }

  error(message: string, error?: unknown, data?: object) {
    logger.error(
      {
        context: this.context,
        error: error instanceof Error ? error : undefined,
        ...data
      },
      message
    );
  }

  warn(message: string, data?: object) {
    logger.warn({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: object) {
    logger.debug({ context: this.context, ...data }, message);
  }
}

export const moniteLogger = new Logger('MoniteService');
export const authLogger = new Logger('AuthService');