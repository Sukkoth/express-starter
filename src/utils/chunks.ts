import { SegmentedMessage } from 'sms-segments-calculator';
import { SmsEncoding } from '@/types/queue-job';
import { env } from '@libs/configs';
import { ValidationException } from '@libs/exceptions/validation-exception';

type Props = {
  /** Message text to be checked */
  message: string;
  /**
   * Encoding the user has provided
   *
   * @link - {@link SmsEncoding}
   */
  encoding?: SmsEncoding;
};

/**
 * Checks the message and encoding, calculates the number of SMS chunks, and
 * throws an error if the message is too long or the encoding mismatches with
 * message content.
 *
 *      const { encoding, chunks } = checkMessageChunkAndEncoding({
 *           message: 'Hello World',
 *           encoding: 'GSM,
 *       });
 *
 *       console.log({ encoding, chunks })
 *
 * @param {Props} - Props - The message and optional encoding to check.
 * @throws {ValidationException} - Throws if the message exceeds the allowed
 *   chunk count or encoding does not match.
 */
export function checkMessageChunkAndEncoding({ message, encoding }: Props) {
  let result: SegmentedMessage;

  // Use the provided encoding or fall back to auto detection
  const characterEncoding = {
    GSM: 'GSM-7',
    Unicode: 'UCS-2',
    default: 'auto',
  }[encoding || 'default'] as 'GSM-7' | 'UCS-2' | 'auto';

  try {
    result = new SegmentedMessage(message, characterEncoding);
  } catch {
    throw new ValidationException({
      message: 'Message and the provided encoding do not match',
      violations: {
        text: ['Message and the provided encoding do not match'],
        encoding: ['Message and the provided encoding do not match'],
      },
    });
  }

  // Check if the message exceeds the max allowed chunks
  if (result.segmentsCount > env.MAX_SMS_CHUNKS) {
    throw new ValidationException({
      message: 'Message is too long',
      violations: {
        text: [getEncodingLimitError(message, result.encodingName)],
      },
    });
  }

  return {
    chunks: result.segmentsCount,
    encoding: result.encodingName === 'GSM-7' ? 'GSM' : 'Unicode',
  };
}

/**
 * Returns a formatted error message for messages that exceed chunk limits.
 *
 * @param {string} text - The message text to check.
 * @param {'gsm' | 'unicode'} encoding - The encoding type.
 */
function getEncodingLimitError(text: string, encoding: 'GSM-7' | 'UCS-2') {
  const isGsm = encoding === 'GSM-7';

  // Limits for 6 chunks
  const multiLimit = isGsm ? 153 : 67;

  // Calculate the max allowed characters
  const maxAllowedCharacters = multiLimit * env.MAX_SMS_CHUNKS;

  return `Message too long for ${encoding === 'GSM-7' ? 'GSM' : 'Unicode'} encoding. Max allowed is ${maxAllowedCharacters} characters for ${env.MAX_SMS_CHUNKS} chunk(s).`;
}
