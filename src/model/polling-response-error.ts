/**
 * Model of error during polling response
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
export interface PollingResponseError {
    code: number,
    message: string,
}