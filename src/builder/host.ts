import {Identifier} from "./identifier";

/**
 * Part of {@link BoschSmartHomeBridgeBuilder} to make sure that required properties are set.
 * This is for BSHC host
 *
 * @author Christopher Holomek
 * @since 28.11.2019
 */
export interface Host {

    /**
     * Set host name / ip address of BSHC
     * @param host name / ip address of BSHC
     */
    withHost(host: string): Identifier;
}