import { BoschSmartHomeBridgeBuilder } from './bosch-smart-home-bridge-builder';

/**
 * Part of {@link BoschSmartHomeBridgeBuilder} to make sure that required properties are set.
 * This is for client private key
 *
 * @author Christopher Holomek
 * @since 28.11.2019
 */
export interface ClientKey {
  /**
   * Set client private key (2048bit)
   * @param clientPrivateKey
   *        private key to use.<br>
   *        Format: -----BEGIN RSA PRIVATE KEY-----{your private key}-----END RSA PRIVATE KEY-----
   */
  withClientPrivateKey(clientPrivateKey: string): BoschSmartHomeBridgeBuilder;
}
