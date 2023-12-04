import express, { Router } from "express";
import bodyParser from "body-parser";
import { BshbUtils } from "../src";
import https from "https";

const bshc = express();
let bshcRouter: Router;
export const createBshcRouter = () => {
  bshcRouter = express.Router();
  return bshcRouter;
};
const bshcAdmin = express();

bshc.use(bodyParser.json());
bshc.use((req, res, next) => {
  console.log(`@${req.method} ${req.path}`);
  bshcRouter(req, res, next);
  next();
});

const certResult = BshbUtils.generateClientCertificate();

const server = https.createServer({ key: certResult.private, cert: certResult.cert }, bshc);
const adminServer = https.createServer({ key: certResult.private, cert: certResult.cert }, bshcAdmin);

server.listen(8444, () => {});
adminServer.listen(8443, () => {});
