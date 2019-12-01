declare module 'selfsigned' {
    const selfsigned: SelfSigned;
    export default selfsigned;

    interface SelfSigned {
        generate(attrs: any[] | null, options: any, done: (error: Error | null, certificate: CertificateDefinition) => void): CertificateDefinition;

        generate(attrs: any[] | null, options: any): CertificateDefinition;

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
}