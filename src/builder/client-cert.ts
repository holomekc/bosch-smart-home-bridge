import { ClientKey } from "./client-key";

/**
 * Part of {@link BoschSmartHomeBridgeBuilder} to make sure that required properties are set.
 * This is for client certificate
 *
 * @author Christopher Holomek
 * @since 28.11.2019
 */
export interface ClientCert {
  /**
   * Set client certificate (2048 bit self signed, base64 encoded)
   * @param clientCert
   *        certificate to use.<br>
   *        Format: -----BEGIN CERTIFICATE-----{your certificate}-----END CERTIFICATE-----
   */
  withClientCert(clientCert: string): ClientKey;
}
