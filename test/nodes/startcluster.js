#!/usr/bin/env node
/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');

const parseArgs = require('minimist');
const range = require('lodash.range');

const { chain, mapPromise, execPromise } = require('./promiseUtils');

const {
  weiToEth, newAddress, requestFaucet, pollBalance,
} = require('./ethUtils');

const baseDir = path.resolve(path.dirname(process.argv[1]));

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    nodeCount: ['n'],
    rpcPortStart: ['p', 'rpc-port-start'],
    discoveryPortStart: ['l', 'discovery-port-start'],
    rpcBindIp: ['rpc-bind-ip'],
    discoveryBindIp: ['discovery-bind-ip'],
    ethRpcEndpoint: ['h', 'rpc-endpoint'],
    pollInterval: ['poll-interval'],
    keysDir: ['k', 'keystore'],
    passwordFile: ['password-file'],
    clusterFile: ['cluster-file'],
    logsDir: ['logs-dir'],
  },
  strings: ['rpcBindIp', 'discoveryBindIp', 'ethRpcEndpoint', 'passwordFile', 'keysDir', 'logsDir'],
  default: {
    nodeCount: 2,
    rpcPortStart: 5001,
    rpcBindIp: '127.0.0.1',
    discoveryPortStart: 40001,
    discoveryBindIp: '0.0.0.0',
    ethRpcEndpoint: 'http://localhost:8545',
    pollInterval: 2000,
    keysDir: path.join(baseDir, 'keys'),
    passwordFile: path.join(baseDir, 'password.txt'),
    clusterFile: path.join(baseDir, 'cluster.json'),
    logsDir: path.join(baseDir, 'logs'),
  },
});

const {
  nodeCount, keysDir, passwordFile, clusterFile, ethRpcEndpoint, pollInterval,
  rpcPortStart, rpcBindIp, discoveryPortStart, discoveryBindIp, logsDir,
} = argv;

const print = (...m) => process.stdout.write(...m);
const println = (...m) => console.log(...m);

function handleError(message) {
  if (message) {
    console.error(message);
    process.exit(1);
  }
}

function validateInt(value, condition, message) {
  const satisfiesCondition = typeof condition === 'function' ? condition(value) : value;
  if (!Number.isInteger(value) || !satisfiesCondition) {
    handleError(`${message}, got: ${value}`);
  }
}

validateInt(nodeCount, n => n > 0, 'Node count must be integer > 0');
validateInt(rpcPortStart, n => n > 0 && n < (2 ** 16), 'Valid starting port number required');
validateInt(pollInterval, n => n > 100, 'Poll interval must be at least 100ms');

mkdirp.sync(logsDir);
mkdirp.sync(keysDir);

// Generate password file if doesn't exist
if (!fs.existsSync(passwordFile)) {
  println('Generating password file for keys...');
  mkdirp.sync(path.dirname(passwordFile));
  const password = crypto.randomBytes(128).toString('base64');
  fs.writeFileSync(passwordFile, password, { mode: 0o600 });
  println(`Password stored in ${passwordFile}`);
} else {
  fs.accessSync(passwordFile, fs.access.R_OK);
}

let lastClusterInfo;
if (fs.existsSync(clusterFile)) {
  lastClusterInfo = JSON.parse(fs.readFileSync(clusterFile, { encoding: 'utf8' }));
}

/**
  * Polls address until balance is more than a certain amount.
  *
  * @param {String} address - Ethereum address
  * @param {Number} [moreThanAmount] - wait until balance is at least this (in wei)
  * @return {Promise}
  * @fulfill {Number} the address balance (in wei)
  * @reject {Error}
  */
function waitForFunds(address, moreThanAmount = 0) {
  print('Waiting for funds...');
  return pollBalance(address, pollInterval, (n) => {
    print('.');
    return n > moreThanAmount;
  }, ethRpcEndpoint).then(chain(balance =>
    println(`Received ${weiToEth(balance)} ETH`)));
}

/**
  * Sends ether to the specified address using a faucet.
  *
  * @param {String} address - Ethereum address
  * @returns {Promise}
  * @fulfill {String} the original address
  * @reject {Error} on faucet failure
  */
function fundAccount(address) {
  print('Requesting faucet...');
  return requestFaucet(address)
    .then((success) => {
      if (!success) {
        throw new Error('Faucet unavailable.');
      }
      print('Success. ');
      return address;
    });
}

/**
  * Creates new ethereum addresses, loads ether into each, and waits for their balances to
  * update before resolving.
  *
  * @param {Number} count - number of addresses to setup
  * @return {Promise}
  * @fulfill {String[]} ethereum addresses created
  * @reject {Error}
  */
function createAccounts(count) {
  println(`Generating ${nodeCount} addresses...`);
  return mapPromise(range(count), () =>
    newAddress(passwordFile, keysDir)
      .then(chain(address => print(`${address} - `)))
      .then(chain(fundAccount))
      .then(chain(waitForFunds)));
}

function checkNodeRunning(params, cb) {
  const { address, rpc, discovery } = params;
  return execPromise(`ps aux | grep -e ${address} -e ${rpc} -e ${discovery}`)
    // .then(({ stdout }) => println(stdout))
    .then(() => Promise.resolve(cb()));
}

/**
  * Starts a new raiden node.
  *
  * @param {Object} params - Parameters to specifying how to start the node
  * @param {String} params.address - Ethereum address to use
  * @param {String} params.rpc - {@code <ip>:<port>} for RPC server to bind to
  * @param {String} params.discovery - {@code <ip>:<port>} for raiden discovery protocol to bind to
  * @param {String} params.log - Path to log stdout and stderr to
  * @return {Promise}
  * @fulfill {Object} containing original params and pid of the process
  * @reject {Error}
  */
function startNode(params) {
  const { address, rpc, discovery, log } = params;
  return checkNodeRunning(params, () => {
    const command = `raiden \
      --listen-address ${rpc} \
      --api-address ${discovery} \
      --address ${address} \
      --password-file ${passwordFile} \
      --keystore-path ${keysDir} \
      --eth-rpc-endpoint ${ethRpcEndpoint} \
      --eth-client-communication >> ${log} 2>&1 &`;
    fs.writeFileSync(log, `[${new Date().toISOString()}] ${process.env.SHELL || 'CMD'} ${command.replace(/--/g, '\n  --')}\n`, { flag: 'a' });
    return execPromise(command)
      .then(({ child: { pid } }) => Object.assign({ pid }, params))
      .then(chain(() => println(`Started node for ${address} (rpc=${rpc}, discovery=${discovery})`)));
  });
}

function determineNodeParams() {
  if (lastClusterInfo) {
    const { nodes } = lastClusterInfo;
    if (nodes) {
      println('Found saved cluster...');
      return Promise.resolve(nodes);
    }
    throw new Error(`Invalid clusterFile: missing field 'nodes' ${clusterFile}`);
  }
  return createAccounts(nodeCount)
    .then(addresses => addresses
      .map((address, i) => ({
        address,
        rpc: `${rpcBindIp}:${rpcPortStart + i}`,
        discovery: `${discoveryBindIp}:${discoveryPortStart + i}`,
        log: path.join(logsDir, `node-${address}.log`),
      })));
}

// TODO: Avoid killing nodes
print('Killing all raiden processes...');
execPromise('pkill -f raiden/bin/raiden')
  .catch((err) => {
    if (err.code === 1) {
      println('none running.');
      return Promise.resolve();
    }
    return Promise.reject(err);
  })
  .then(killResult => killResult && println('done.'))
  .then(determineNodeParams)
  .then(nodeParams => mapPromise(nodeParams, startNode))
  .then(createdNodes => ({
    created: new Date().toISOString(),
    keystore: keysDir,
    passwordFile,
    ethRpcEndpoint,
    nodes: createdNodes,
  }))
  .then(clusterInfo => fs.writeFileSync(clusterFile, JSON.stringify(clusterInfo, null, 2)))
  .catch(handleError);
