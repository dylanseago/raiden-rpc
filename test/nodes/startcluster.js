#!/usr/bin/env node
/* eslint-disable no-console */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const parseArgs = require('minimist');
const request = require('request-promise-any');

const { normalize, getBalance, pollBalance } = require('./eth-utils');

const baseDir = path.resolve(path.dirname(process.argv[1]));

const argv = parseArgs(process.argv.slice(2), {
  strings: ['h', 'rpc-endpoint', 'password-file', 'keystore', 'logs-dir', 'poll-interval'],
  alias: {
    nodeCount: ['c', 'count'],
    rpcPortStart: ['p', 'first-port'],
    pollInterval: ['poll-interval'],
    ethRpcEndpoint: ['h', 'rpc-endpoint'],
    keysDir: ['k', 'keystore'],
    passwordFile: ['password-file'],
    logsDir: ['logs-dir'],
  },
  default: {
    nodeCount: 2,
    rpcPortStart: 4010,
    pollInterval: 2000,
    ethRpcEndpoint: 'http://localhost:8545',
    passwordFile: path.join(baseDir, 'password.txt'),
    keysDir: path.join(baseDir, 'keys'),
    logsDir: path.join(baseDir, 'logs'),
  },
});

const {
  nodeCount, rpcPortStart, pollInterval,
  ethRpcEndpoint, passwordFile, keysDir, logsDir,
} = argv;

if (!Number.isInteger(nodeCount) || nodeCount < 1) {
  console.error(`Node count must be integer > 0, got ${nodeCount}`);
  process.exit(1);
}

if (!Number.isInteger(rpcPortStart) || rpcPortStart < 1 || rpcPortStart > (2 ** 16) - 1) {
  console.error(`Require valid starting port number, got ${rpcPortStart}`);
  process.exit(1);
}

function handleError(message) {
  if (message) {
    console.error(message);
    process.exit(1);
  }
}

mkdirp.sync(logsDir);
mkdirp.sync(keysDir);

// Generate password file if doesn't exist
if (!fs.existsSync(passwordFile)) {
  mkdirp.sync(path.dirname(passwordFile));
  const password = crypto
    .createHmac('sha256', Date.now())
    .digest('base64')
    .substring(0, 32);
  fs.writeFileSync(passwordFile, password, { mode: 0o600 });
  console.log(`Generated password file ${passwordFile}`);
} else {
  fs.acessSync(passwordFile, fs.access.R_OK);
}

function execPromise(command, options = {}) {
  return Promise.resolve().then(() => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        Promise.reject(error);
      }
      Promise.resolve({ stdout, stderr });
    });
  });
}

for (let rpcPort = rpcPortStart; rpcPort < rpcPortStart + nodeCount; rpcPort += 1) {
  console.log('Generating ethereum address...');
  execPromise(`geth account new --password ${passwordFile} --keystore ${keysDir}`)
    .then(({ stdout }) => normalize(stdout.match(/([0-9a-f]{40})/)[1]))
    .then((address) => {
      console.log(`Requesting ether for ${address} from faucet...`);
      return request.get({
        uri: `http://faucet.ropsten.be:3001/donate/${address}`,
        json: true,
      }).then((result) => {
        if (!result || !Number.isInteger(result.paydate)) {
          handleError(`Unrecognized faucet api result, got: ${JSON.stringify(result, null, 2)}`);
        }
        if (result.paydate === 0) {
          console.log('Faucet unavailable for this address. Checking balance...');
          return getBalance(address, ethRpcEndpoint).then((balance) => {
            if (balance === 0) {
              handleError(`Error: Balance of ${address} is 0`);
            }
            return balance;
          });
        }
        console.log(`Polling every ${pollInterval}ms until balance is greater than zero...`);
        return pollBalance(address, pollInterval, n => n > 0, ethRpcEndpoint);
      }).then(() => {
        const raidenRpcEndpoint = `127.0.0.1:${rpcPort}`;
        const raidenListenEndpoint = `0.0.0.0:4${rpcPort}`;
        const logFile = path.join(logsDir, `node-${address}.log`);
        fs.writeFileSync(logFile, `[${new Date().toISOString()}] Starting raiden node...`, { flag: 'a' });
        return execPromise(`raiden \
          --listen-address ${raidenListenEndpoint} \
          --api-address ${raidenRpcEndpoint} \
          --address ${address} \
          --password-file ${passwordFile} \
          --keystore-path ${keysDir} \
          --eth-rpc-endpoint ${ethRpcEndpoint} \
          --eth-client-communication >> ${logFile} 2>&1 &`)
          .then(() => console.log(`Started raiden node in background for ${address} with rpc ${raidenRpcEndpoint} listening on ${raidenListenEndpoint}`));
      });
    });
}
