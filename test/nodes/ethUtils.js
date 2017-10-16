/**
  * Ethereum RPC utils
  * @module eth-rpc-utils
  */
/* eslint-disable no-console */
const request = require('request-promise-any');
const ethAddress = require('ethereum-address');

const { pollUntil, execPromise } = require('./promiseUtils');

const DEFAULT_RPC = 'https://localhost:8545';

const WEI_TO_ETH = 1000000000000000000;

function normalize(address) {
  if (address.indexOf('0x') === -1) {
    return `0x${address}`;
  }
  return address;
}

function validateAddress(address) {
  if (!ethAddress.isAddress(address)) {
    throw new Error(`Invalid Ethereum address ${address}`);
  }
}

function weiToEth(wei) {
  return wei / WEI_TO_ETH;
}

function newAddress(passwordFile, saveToDir) {
  return execPromise(`geth account new --password ${passwordFile} --keystore ${saveToDir}`)
    .then(({ stdout }) => normalize(stdout.match(/([0-9a-f]{40})/)[1]));
}

function requestFaucet(address) {
  if (!address) throw new Error('Undefined address');
  return request.get({
    uri: `http://faucet.ropsten.be:3001/donate/${address}`,
    json: true,
  }).then((result) => {
    if (!result || !Number.isInteger(result.paydate)) {
      throw new Error(`Faucet api result missing paydate field. result: ${JSON.stringify(result, null, 2)}`);
    }
    return result.paydate !== 0;
  });
}

/**
  * Retrieves balance of address using rpc
  *
  * @static
  * @param {String} address - Ethereum address
  * @param {String} rpcEndpoint - Ethereum node RPC endpoint
  * @return {Number} balance in wei
  */
function getBalance(address, rpcEndpoint = DEFAULT_RPC) {
  address = normalize(address);
  validateAddress(address);
  return request.post(rpcEndpoint, {
    json: true,
    body: {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    },
  }).then(data => Number.parseInt(data.result, 16));
}

/**
  * Polls balance at a specified interval until a condition is met.
  *
  * @static
  * @param {String} address - Ethereum address
  * @param {Number} interval - poll interval in ms
  * @param {Function} condition - polling ends when condition(balance) === true
  * @return {Promise}
  * @fulfill {Number} - balance of that address
  * @reject {Error} - request error
  */
function pollBalance(address, interval, condition, rpcEndpoint = DEFAULT_RPC) {
  address = normalize(address);
  validateAddress(address);
  return pollUntil(() => getBalance(address, rpcEndpoint), interval, condition);
}

module.exports = {
  normalize,
  validateAddress,
  weiToEth,
  newAddress,
  requestFaucet,
  getBalance,
  pollBalance,
};

