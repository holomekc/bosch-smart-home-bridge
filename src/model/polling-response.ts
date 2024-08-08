import { PollingResponseError } from './polling-response-error';

/**
 * Model of polling response
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
export interface PollingResponse {
  jsonrpc: string;
  result?: any[];
  error?: PollingResponseError;
}
