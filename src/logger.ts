/**
 * Logger interface which is used in this project. Allows to specify actual logging in any way you like.
 * Every log contains an optional message and optional parameters. parameters should be logged in a way so that
 * the content is readable.
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export interface Logger {
  /**
   * Logs on fine level
   *
   * @param message
   *        message
   * @param optionalParams
   *        optional object
   */
  fine(message?: any, ...optionalParams: any[]): void;

  /**
   * Logs on debug level
   *
   * @param message
   *        message
   * @param optionalParams
   *        optional object
   */
  debug(message?: any, ...optionalParams: any[]): void;

  /**
   * Logs on info level
   *
   * @param message
   *        message
   * @param optionalParams
   *        optional object
   */
  info(message?: any, ...optionalParams: any[]): void;

  /**
   * Logs on warn level
   *
   * @param message
   *        message
   * @param optionalParams
   *        optional object
   */
  warn(message?: any, ...optionalParams: any[]): void;

  /**
   * Logs on error level
   *
   * @param message
   *        message
   * @param optionalParams
   *        optional object
   */
  error(message?: any, ...optionalParams: any[]): void;
}

/**
 * A default implementation of the {@link Logger} which is using {@link console}
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class DefaultLogger implements Logger {
  fine(message?: any, ...optionalParams: any[]): void {
    DefaultLogger.log('debug', message, ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    DefaultLogger.log('debug', message, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]): void {
    DefaultLogger.log('info', message, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    DefaultLogger.log('warn', message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    DefaultLogger.log('error', message, ...optionalParams);
  }

  private static log(msgType: 'debug' | 'info' | 'warn' | 'error', message?: any, ...optionalParams: any[]) {
    if (message) {
      if (optionalParams.length > 0) {
        console[msgType](message, optionalParams);
      } else {
        console[msgType](message);
      }
    } else {
      if (optionalParams.length > 0) {
        console[msgType](optionalParams);
      } else {
        console[msgType]();
      }
    }
  }
}
