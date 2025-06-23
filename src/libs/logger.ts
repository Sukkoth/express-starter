import winston from 'winston';
import util from 'util';
import { env } from '@libs/configs';
import { asyncLocalStorage } from '@libs/context';
import { DateTime } from 'luxon';

// Define log levels
const levels = {
  error: 0, // Critical failures
  warn: 1, // Potential issues
  http: 2, // HTTP request logs (middleware, API)
  info: 3, // App-level info (startup, status)
  debug: 4, // Low-level debug info
};

// Determine log level based on environment
const level = () => (env.NODE_ENV === 'development' ? 'debug' : 'info');

// Define color scheme for log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Apply colors to Winston
winston.addColors(colors);

// 3. Configure Winston logger with a format that adds requestId
const requestIdFormat = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    // Add the requestId to each log message
    (info as unknown as { requestId: string }).requestId = store.requestId;
  }
  return info;
});

// Custom log format that ensures metadata is displayed correctly
const format = winston.format.combine(
  requestIdFormat(),
  winston.format.timestamp({
    format: () =>
      DateTime.now()
        .setZone('Africa/Addis_Ababa')
        .toFormat('yyyy-MM-dd HH:mm:ss.SSS'),
  }),
  winston.format.printf(({ timestamp, level, requestId, message, ...meta }) => {
    const coloredLevel = winston.format
      .colorize()
      .colorize(level, level.toUpperCase());

    // If message is an object, convert it to a string properly
    let formattedMessage = message;
    if (typeof message === 'object') {
      formattedMessage = util.inspect(message, { colors: true, depth: null });
    }

    // If no message and only metadata exists, use metadata as the message
    if (!formattedMessage && Object.keys(meta).length) {
      formattedMessage = util.inspect(meta, { colors: true, depth: null });
      meta = {}; // Clear meta to prevent double printing
    }

    // Remove internal Symbol properties
    const cleanedMeta = JSON.parse(
      JSON.stringify(meta, (key, value) =>
        typeof key === 'symbol' ? undefined : value,
      ),
    );

    // Format metadata correctly
    const metaString = Object.keys(cleanedMeta).length
      ? ` ${util.inspect(cleanedMeta, { colors: true, depth: null })} ` //mind the space at the start and end
      : '';

    const idLabel = requestId ? `[requestId: ${requestId}] ` : '';

    return `${timestamp} ${coloredLevel}: ${idLabel}${formattedMessage}${metaString}`;
  }),
);

// Define transports
const transports: (
  | winston.transports.ConsoleTransportInstance
  | winston.transports.FileTransportInstance
)[] = [new winston.transports.Console()];

// Create and export the logger
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;
