/**
  * Ethereum RPC utils
  * @module eth-rpc-utils
  */
/* eslint-disable no-console */
const request = require('request-promise-any');
const ethAddress = require('ethereum-address');

const DEFAULT_RPC = 'https://localhost:8545';

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
  return Promise.resolve()
    .then(() => getBalance(address, rpcEndpoint))
    .then(balance => (condition(balance)
      ? Promise.resolve(balance)
      : Promise.delay(interval))
      .then(() => pollBalance(address, interval, condition, rpcEndpoint)))
    .cancellable();
}

module.exports = {
  normalize,
  validateAddress,
  getBalance,
  pollBalance,
};

