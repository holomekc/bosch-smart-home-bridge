/**
 * Minimal type definition for selfsigned
 * @author Christopher Holomek
 * @since 26.09.2019
 */
declare module 'selfsigned' {
    const selfsigned: SelfSigned;
    export default selfsigned;

    interface SelfSigned {
        /**
         * Generate certificate
         * @param attrs
         *        attributes to use
         * @param options
         *        options for generation
         * @param done
         *        callback after generation of certificate is done
         */
        generate(attrs: any[] | null, options: Options, done: (error: Error | null, certificate: CertificateDefinition) => void): void;

        /**
         * Generate certificate
         * @param attrs
         *        attributes to use
         * @param options
         *        options for generation
         */
        generate(attrs: any[] | null, options: Options): CertificateDefinition;

        /**
         * Generate certificate
         * @param done
         *        callback after generation of certificate is done
         */
        generate(done: (error: Error | null, certificate: CertificateDefinition) => void): void;
    }

    export interface CertificateDefinition {
        private: string;
        public: string;
        cert: string;
        fingerprint: string;
        clientprivate: string;
        clientpublic: string;
        clientcert: string;
    }

    export interface Options {
        keySize?: number;
        days?: number;
        algorithm?: 'sha1' | 'sha256';
        extensions?: any[];
        pkcs7?: boolean;
        clientCertificate?: boolean;
        clientCertificateCN?: string;
    }
}