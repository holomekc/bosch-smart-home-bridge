/**
 * Types of errors which may occur during calls to BSHC
 *
 * @author Christopher Holomek
 * @since 06.01.2020
 */
export enum BshbErrorType {
    /**
     * undefined error
     */
    ERROR,
    /**
     * aborted by client
     */
    ABORT,
    /**
     * timeout during call
     */
    TIMEOUT,
    /**
     * jsonrpc error during polling
     */
    POLLING,
    /**
     * Could not parse response
     */
    PARSING
}