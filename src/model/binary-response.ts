export interface BinaryResponse {
  /**
   * The full content-disposition of the response if available
   */
  contentDisposition?: string;
  /**
   * The file name extracted from the content-disposition if possible
   */
  fileName?: string;
  /**
   * The binary data.
   */
  data: Buffer<ArrayBuffer>;
}
