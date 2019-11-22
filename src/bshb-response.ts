import * as http from "http";

/**
 * This response object is used to wrap the response from BSHC. It contains the {@link http.IncomingMessage}
 * which provides detailed information about response. Furthermore, it contains the parsed response <T>.
 */
export class BshbResponse<T> {

    constructor(private _incomingMessage: http.IncomingMessage, private _parsedResponse: T) {
    }

    /**
     * Get detailed information about HTTP response
     */
    get incomingMessage(): http.IncomingMessage {
        return this._incomingMessage;
    }

    /**
     * Get parsed response object
     */
    get parsedResponse(): T {
        return this._parsedResponse;
    }
}