import {Host} from "./host";
import {DefaultLogger, Logger} from "../logger";
import {BoschSmartHomeBridge} from "../bosch-smart-home-bridge";
import {ClientCert} from "./client-cert";
import {ClientKey} from "./client-key";

/**
 * Builder for creating BoschSmartHomeBridge to make sure that properties are correctly set.
 *
 * @author Christopher Holomek
 * @since 28.11.2019
 */
export class BoschSmartHomeBridgeBuilder implements Host, ClientCert, ClientKey {

    private _host: string = undefined as unknown as string;
    private _clientCert: string = undefined as unknown as string;
    private _clientPrivateKey: string = undefined as unknown as string;
    private _logger: Logger = new DefaultLogger();

    /**
     * Hide constructor
     */
    private constructor() {
        // Hide constructor
    }

    /**
     * Create a new instance of a builder
     */
    public static builder(): Host {
        return new BoschSmartHomeBridgeBuilder();
    }

    /**
     * Get host name / ip address of BSHC
     */
    get host(): string {
        return this._host;
    }

    public withHost(host: string): BoschSmartHomeBridgeBuilder {
        this._host = host;
        return this;
    }

    /**
     * Get client certificate (base64)
     */
    get clientCert(): string {
        return this._clientCert;
    }

    public withClientCert(clientCert: string): BoschSmartHomeBridgeBuilder {
        this._clientCert = clientCert;
        return this;
    }

    /**
     * Get client private key (base64)
     */
    get clientPrivateKey(): string {
        return this._clientPrivateKey;
    }

    public withClientPrivateKey(clientPrivateKey: string): BoschSmartHomeBridgeBuilder {
        this._clientPrivateKey = clientPrivateKey;
        return this;
    }

    /**
     * Get logger
     */
    get logger(): Logger {
        return this._logger;
    }

    /**
     * Set logger to use
     * @param logger
     *        logger to use
     */
    public withLogger(logger: Logger): BoschSmartHomeBridgeBuilder {
        this._logger = logger;
        return this;
    }

    /**
     * Build {@link BoschSmartHomeBridge}. Required properties are: <br>
     *     - host <br>
     *     - identifier <br>
     *     - clientCert <br>
     *     - clientPrivateKey <br>
     */
    public build(): BoschSmartHomeBridge {
        if (!this.host) {
            throw new Error("host is a required property. withHost must be called with a suitable value.");
        }

        if (!this.clientCert) {
            throw new Error("clientCert is a required property. withClientCert must be called with a suitable value.");
        }

        if (!this.clientPrivateKey) {
            throw new Error("clientPrivateKey is a required property. withClientPrivateKey must be called with a suitable value");
        }
        return new BoschSmartHomeBridge(this);
    }
}