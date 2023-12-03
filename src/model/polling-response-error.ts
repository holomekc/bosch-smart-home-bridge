/**
 * Model of error during polling response
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
export interface PollingResponseError extends Error {
  code: number;
  message: string;
}
