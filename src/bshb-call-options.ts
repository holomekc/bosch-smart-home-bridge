import { RequestOptions } from 'https';

/**
 * Contains options for an http call
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BshbCallOptions extends RequestOptions {
  // at the moment we do not extend the options for a request. Keep the interface to make it easier to extend
  // in case it will be relevant again
}
