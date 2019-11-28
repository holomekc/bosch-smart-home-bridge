import {ClientCert} from "./client-cert";

/**
 * Part of {@link BoschSmartHomeBridgeBuilder} to make sure that required properties are set.
 * This is for unique identifier
 *
 * @author Christopher Holomek
 * @since 28.11.2019
 */
export interface Identifier {
    
    /**
     * Set unique identifier to use (during pairing or for communication). "oss_" prefix is added automatically.
     * @param identifier unique value
     */
    withIdentifier(identifier: string): ClientCert
}