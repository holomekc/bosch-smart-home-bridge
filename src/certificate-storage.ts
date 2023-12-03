/**
 * This class is a container for client certificate and private key
 *
 * @author Christopher Holomek
 * @since 26.09.2019
 */
export class CertificateStorage {
  private readonly _clientCert: string = undefined as unknown as string;
  private readonly _clientPrivateKey: string = undefined as unknown as string;

  /**
   * Create a new instance
   *
   * @param clientCert
   *        client certificate base64 encoded
   * @param clientPrivateKey
   *        client private key base64 encoded
   */
  constructor(clientCert: string, clientPrivateKey: string) {
    this._clientCert = clientCert;
    this._clientPrivateKey = clientPrivateKey;
  }

  /**
   * Get client certificate content as string
   */
  get clientCert(): string {
    return this._clientCert;
  }

  /**
   * Get client certificate key as string
   */
  get clientPrivateKey(): string {
    return this._clientPrivateKey;
  }
}
