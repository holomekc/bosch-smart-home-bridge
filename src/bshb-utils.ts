import selfsigned, {CertificateDefinition} from 'selfsigned';
import uuid from "uuid";

/**
 * Utils class which provides some helpful methods when using BSHB.
 */
export class BshbUtils {

    /**
     * Generate a client certificate for communication with BSHC
     */
    public static generateClientCertificate(): CertificateDefinition {
        return selfsigned.generate(null,
            {keySize: 2048, clientCertificate: false, algorithm: 'sha256'});
    }

    /**
     * Generate a random identifier which is needed during pairing process.
     */
    public static generateIdentifier(): string {
        return uuid.v4();
    }

    /**
     * Get root ca certificate of Bosch Smart Home Controller.
     */
    public static getBoschSmartHomeControllerRootCa(): string {
        return "-----BEGIN CERTIFICATE-----\n" +
            "MIIFujCCA6KgAwIBAgIUIbQ+BIVcGVD29UIe+Sv6/+Qy/OUwDQYJKoZIhvcNAQEL\n" +
            "BQAwYzELMAkGA1UEBhMCREUxITAfBgNVBAoMGEJvc2NoIFRoZXJtb3RlY2huaWsg\n" +
            "R21iSDExMC8GA1UEAwwoU21hcnQgSG9tZSBDb250cm9sbGVyIFByb2R1Y3RpdmUg\n" +
            "Um9vdCBDQTAeFw0xNTA4MTgwNzIwMTNaFw0zNTA4MTQwNzIwMTNaMGMxCzAJBgNV\n" +
            "BAYTAkRFMSEwHwYDVQQKDBhCb3NjaCBUaGVybW90ZWNobmlrIEdtYkgxMTAvBgNV\n" +
            "BAMMKFNtYXJ0IEhvbWUgQ29udHJvbGxlciBQcm9kdWN0aXZlIFJvb3QgQ0EwggIi\n" +
            "MA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCcFmt1vu85lfXMl66Ix32tmEbc\n" +
            "n4bt6Oa6QIiT6zJIR2DsE85c42H8XogATWiqfp3FTbmfIIijfoj9JL6uyFkw0yrT\n" +
            "qfttw9KD8DRIV973F1UyAP8wPxpdt2QPJCBMmqymC6h2oT7eS6hRIMbY3SFLa5lO\n" +
            "4EQ10uflZnY9Yv7kTzeuEw1qWqd8kHhfDBq3k2N90oopt47ghDQ/qUmne19xp0jQ\n" +
            "fXFA6hfudNcU9vuZ6hvObm25++ySmRKvtuY+O/CmLVnUJngpKQWJCnYOv3/Z5StZ\n" +
            "5aVvLR028ozc1oqdL8fVeaJX8xIdBsSjB+gOaauEYodJzVfeLdXVb8R4CqVighci\n" +
            "EUuwZVhzdtA5qs2O9jLJv6JFiD+uuRn8Ip1uYiajYqkRzR2egKWFfhZvV6Yk2zuw\n" +
            "s8FUtagtYRwKCp+F+f+PCryLcBcnyc7iVm0Xo7kQAjzoDql4vmXQybmP6kU9qzmD\n" +
            "xEG02s6FHVn1X1X4htXc/+Wh0/0850T+Up2HeN+ZN92BubI8yM62mecvfx08vSb1\n" +
            "5AviYkQQE37KzGeKYYbciEMeVu5sLx/lN6YIcyHY5kTUsU7SCzw7vTTsNjTzuzYa\n" +
            "l2fudHS8lOHaAwvZP//14cM+N9beQqLzxS7jdmFQxtToyzdbgL1OekO58fiqti4W\n" +
            "d88bnmMBZsl3bR9b5QIDAQABo2YwZDASBgNVHRMBAf8ECDAGAQH/AgECMB0GA1Ud\n" +
            "DgQWBBThUGsROMNnqMhPn+qFxk8R9VdWPjAfBgNVHSMEGDAWgBThUGsROMNnqMhP\n" +
            "n+qFxk8R9VdWPjAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQELBQADggIBAEp2\n" +
            "bQei/KQGrnsnqugeseDVKNTOFp5o0xYz8gXEWzRCuAIo/sYKcFWziquajJWuCt/9\n" +
            "CexNFWkYtV95EbunyE+wijQcnOehGSZ2gWnZiQU2fu1Y4aA5g3LlB61ljnbhX4SE\n" +
            "tLs31iTdjPFcWMx+rsS3+qfuOiOqQbliTykG+p/ULVLLPDCmzL/MHg3w5AiGB8k5\n" +
            "i1npzDKJKpLFGFWEnECYKhPi93rLfdgmOEFalIoFB96/upm6bfOWbNvsdIspFVGe\n" +
            "3zSjWUvveHe9mm+VTq9aldwy/J0/81oFF7C5CmlB31sDwfY+qF5/mHKfPbrnWTIi\n" +
            "QAiZJxXrbmeWX9JVutRbokP1UTX63ghH+BNab/E1D020JVkimMf2Vg1/5WR2gdkN\n" +
            "S4j+f//uVKuCr7bPGWzcADeURlyCmW/O2CNfln+T/0YFg2lET9PAEDkZ7Js3I/4f\n" +
            "+Dy58LwjdQYI3Z6qKA9h0Cfgy6KOA8Omyw3QmdTAAd0EgABQ/vxNVL3Q4Oh8Eiff\n" +
            "ZVrpFWLgMxeRckHTMqG9SfGBdZQCO7XPz7mb/8Da6prEfw4VKvdh9llvatWeB1V1\n" +
            "vqixwFVuHIWKxIiR8GXZEjIQXBmeuzdgIceYcw12HYHLUifFozaNtjxMcPcIALKz\n" +
            "GrR4oS2tFVZCjwF4vPAt15fsbEx/F/NfaO6SAFz8\n" +
            "-----END CERTIFICATE-----\n";
    }
}