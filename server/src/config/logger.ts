import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

// Console format - always needed (Render captures stdout)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: !isProduction }), // No colors in production (cleaner logs)
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length && !meta.service 
      ? ` ${JSON.stringify(meta)}` 
      : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// JSON format for file logs (structured logging)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Build transports based on environment
const transports: winston.transport[] = [];

// ALWAYS add console transport - this is what Render captures!
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// Only add file transports in development (files don't persist on Render)
if (!isProduction) {
  transports.push(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: fileFormat,
    })
  );
}

export const logger = winston.createLogger({
  // Use 'info' in production to see OTP logs, 'debug' in dev for everything
  level: isProduction ? 'info' : 'debug',
  defaultMeta: { service: 'mh26-services-api' },
  transports,
});

// Log startup environment
logger.info(`🚀 Logger initialized [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);

export default logger;
