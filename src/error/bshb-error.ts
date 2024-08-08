import { BshbErrorType } from './bshb-error-type';

/**
 * Error object used by the library
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
export class BshbError extends Error {
  /**
   * Create a new error instance
   *
   * @param message
   *        textual message
   * @param errorType
   *        type of the error to provide more details
   * @param cause
   *        reason for the error (optional)
   */
  constructor(
    message: string,
    public errorType: BshbErrorType,
    public cause?: Error | unknown
  ) {
    super(`[${BshbErrorType[errorType]}] ${message}`, { cause: cause });
    this.name = 'BshbError';
    Error.captureStackTrace(this, BshbError);
  }
}
