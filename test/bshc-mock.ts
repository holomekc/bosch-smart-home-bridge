import express from 'express';
import bodyParser from 'body-parser';
import { BshbUtils, Logger } from '../src';
import https from 'https';

const bshc = express();
let bshcRouter = express.Router();
export const resetBshcRouter = () => {
  bshcRouter = express.Router();
  return bshcRouter;
};

let bshcAdminRouter = express.Router();
export const resetBshcAdminRouter = () => {
  bshcAdminRouter = express.Router();
  return bshcAdminRouter;
};
const bshcAdmin = express();

const conditionalBodyParser = (req: any, res: any, next: any) => {
  if (req.headers['content-type'] === 'application/octet-stream') {
    express.raw({ type: 'application/octet-stream' })(req, res, next);
  } else {
    bodyParser.json()(req, res, next);
  }
};

bshc.use(conditionalBodyParser);
bshc.use((req, res, next) => {
  bshcRouter(req, res, next);
  next();
});

bshcAdmin.use(conditionalBodyParser);
bshcAdmin.use((req, res, next) => {
  bshcAdminRouter(req, res, next);
  next();
});

let server: https.Server;
let adminServer: https.Server;

// Initialize servers lazily
(async () => {
  const certResult = await BshbUtils.generateClientCertificate();
  server = https.createServer({ key: certResult.private, cert: certResult.cert }, bshc);
  adminServer = https.createServer({ key: certResult.private, cert: certResult.cert }, bshcAdmin);
  server.listen(8444, () => {});
  adminServer.listen(8443, () => {});
})();

export class DefaultTestLogger implements Logger {
  fine(message?: any, ...optionalParams: any[]): void {
    DefaultTestLogger.log('debug', message, ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    DefaultTestLogger.log('debug', message, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]): void {
    DefaultTestLogger.log('info', message, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    DefaultTestLogger.log('warn', message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    DefaultTestLogger.log('error', message, ...optionalParams);
  }

  private static log(msgType: 'debug' | 'info' | 'warn' | 'error', message?: any, ...optionalParams: any[]) {
    if (optionalParams[0] && optionalParams[0].ca) {
      optionalParams = [
        {
          path: optionalParams[0].path,
          method: optionalParams[0].method,
          headers: optionalParams[0].headers,
          body: optionalParams[0].body,
        },
      ];
    }
    if (message) {
      if (optionalParams.length > 0) {
        console[msgType](message, optionalParams);
      } else {
        console[msgType](message);
      }
    } else {
      if (optionalParams.length > 0) {
        console[msgType](optionalParams);
      } else {
        console[msgType]();
      }
    }
  }
}
