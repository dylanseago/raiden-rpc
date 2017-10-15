/**
  * @module raiden-rpc
  * @desc A module for interacting with a Raiden network node over RPC.
  * @author Dylan Seago
  *
  * **Installation**
  * ```
  * npm install raiden-rpc
  * ```
  *
  * @example
  * Require the library
  * ```javascript
  * var RaidenClient = require('raiden-rpc');
  * ```
  * Create a new raiden instance for a specific node. See below for possible options.
  * ```javascript
  * // Quick localhost development
  * var localNode = RaidenClient.localNode(); // Uses DEFAULT_RPC_HOST
  * // Custom hostname
  * var myNode = new RaidenClient('http://192.168.1.124:5004');
  * ```
  * Join a token network and transfer tokens to another node
  * ```javascript
  * const testnetToken = '0x0f114a1e9db192502e7856309cc899952b3db1ed';
  * const recipientAddress = '0x61c808d82a3ac53231750dadc13c777b59310bd9';
  * // Retrieve our own address as sanity check
  * myNode.getAddress()
  *   // Deposit 100 testnet tokens, 20 amongst 3 channels, 40 reserved for future channels
  *   .then(myAddress => myNode.joinNetwork(testnetToken, 100, 3, 0.4))
  *   // Promise resolves after all channels opened
  *   // Send 8 tokens to recipient with transfer ID 1337
  *   .then(() => myNode.sendTokens(testnetToken, recipientAddress, 8, 1337))
  *   // Promise resolves after transfer succeeds or fails
  *   // Leave the token network
  *   .then(() => myNode.leaveNetwork(testnetToken));
  * ```
  */

const url = require('url');
const request = require('request-promise-any');
const ethAddress = require('ethereum-address');

/** @constant {String}
  * @default
  */
const DEFAULT_RPC_HOST = 'http://127.0.0.1:5001/';
const DEFAULT_API_VERSION = '1';

/**
  * A class that represents a raiden node. Holds information used to connect to it's rpc interface.
  *
  * @class
  *
  * @param [rpcHost] {String} - the full raiden node hostname
  * @param [apiVersion] {String} - the raiden api version
  * @property baseUrl The baseUrl used to perform requests.
  *
  * @alias module:raiden-rpc
  */
function RaidenClient(rpcHost = DEFAULT_RPC_HOST, apiVersion = DEFAULT_API_VERSION) {
  this.baseUrl = url.resolve(rpcHost, `/api/${apiVersion}`);
}

/**
  * Returns a new instance of {@link RaideNode} connecting to the default localhost node.
  * @static
  * @returns {Raiden}
  */
function localNode() {
  return new RaidenClient();
}

function validateAmount(amount) {
  if (amount <= 0) throw new Error(`Deposit and transfer amounts must not be negative or zero (amount: ${amount})`);
}

function validateAddress(address) {
  if (!ethAddress.isAddress(address)) throw new Error(`Expected a valid ethereum address (got: ${address})`);
}

/**
  * Performs a manual API call on the Raiden node.
  *
  * @instance
  *
  * @param {String} method - request method to use
  * @param {String} uri - the api endpoint to call (relative to {@link RaidenClient#baseUrl})
  * @param {...Object} [options] - custom request options
  *
  * @example
  * ```javascript
  * myNode.customRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } })
  * ```
  */
function customRequest(method, uri, ...options) {
  return request(Object.assign({
    method,
    uri,
    baseUrl: this.baseUrl,
    json: true,
    headers: {
      'content-type': 'application/json',
    },
  }, ...options));
}

/**
  * Retrieves the Ethereum address associated with the node
  *
  * @instance
  *
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {String} - Ethereum address
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-your-address|Raiden docs}
  */
function getAddress(options) {
  return this.customRequest('GET', '/address', options).then(data => data.our_address);
}

/**
  * Registers a token by deploying a channel manager.
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {String} - channel manager Ethereum address
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#registering-a-token|Raiden docs}
  */
function registerToken(tokenAddress, options) {
  validateAddress(tokenAddress);
  return this.customRequest('PUT', `/tokens/${tokenAddress}`, options).then(data => data.channel_manager_address);
}

/**
  * Get a list of addresses of all registered tokens.
  *
  * @instance
  *
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {String[]} - array of Ethereum addresses
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-traded-tokens|Raiden docs}
  */
function getRegisteredTokens(options) {
  return this.customRequest('GET', '/tokens', options);
}

/**
  * Get a list of all partners you have non-settled channels with.
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object[]} - array of objects containing channel_address and partner_address
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-partners-for-a-token|Raiden docs}
  */
function getTokenPartners(tokenAddress, options) {
  validateAddress(tokenAddress);
  return this.customRequest('GET', `/tokens/${tokenAddress}/partners`, options).then(partners =>
    partners.map(data => ({
      partner_address: data.partner_address,
      channel_address: data.channel.split('/').pop(), // extract address from channel uri
    })));
}

/**
  * Query information about your channel.
  *
  * @instance
  *
  * @param {String} channelAddress - Ethereum address
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - object containing information about your channel
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-a-specific-channel|Raiden docs}
  */
function getChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.customRequest('GET', `/channels/${channelAddress}`, options);
}

/**
  * Get a list of all non-settled channels.
  *
  * @instance
  *
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object[]} - array of objects containing information about your channels
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-channels|Raiden docs}
  */
function getAllChannels(options) {
  return this.customRequest('GET', '/channels', options);
}

/**
  * Creates a channel with a partner.
  *
  * @instance
  *
  * @param {String} partnerAddress - Ethereum address of other Raiden node
  * @param {String} tokenAddress - Ethereum address of token that will be transferred in
  * this channel
  * @param {Number} initialBalance - Tokens to initially deposit
  * @param {Number} [settleTimeout] - Number of blocks to wait for settlement after closing
  * this channel
  * @param {Number} [revealTimeout] - Number of blocks to use for reveal timeout
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - objects containing information about your newly created channel
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#open-channel|Raiden docs}
  * @see {@link https://raiden-network.readthedocs.io/en/stable/spec.html#channel-closing-and-settlement|settleTimeout}
  * @see {@link https://raiden-network.readthedocs.io/en/stable/spec.html#safety-of-mediated-transfers|revealTimeout}
  */
function openChannel(
  partnerAddress, tokenAddress, initialBalance,
  settleTimeout, revealTimeout, options,
) {
  validateAddress(partnerAddress);
  validateAddress(tokenAddress);
  return this.customRequest('PUT', '/channels', {
    body: Object.assign(
      {
        partner_address: partnerAddress,
        token_address: tokenAddress,
        balance: initialBalance,
      },
      settleTimeout ? { settle_timeout: settleTimeout } : {},
      revealTimeout ? { reveal_timeout: revealTimeout } : {},
    ),
  }, options);
}

/**
  * Closes an open channel.
  *
  * @instance
  *
  * @param {String} channelAddress - Ethereum address of channel
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - object containing information about your channel
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#close-channel|Raiden docs}
  */
function closeChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.customRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'closed' } }, options);
}

/**
  * Settle a closed channel.
  *
  * @instance
  *
  * @param {String} channelAddress - Ethereum address of channel
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - object containing information about your channel
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#settle-channel|Raiden docs}
  */
function settleChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.customRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'settled' } }, options);
}

/**
  * Deposit more tokens into a channel. Token to deposit was specified on channel creation.
  *
  * @instance
  *
  * @param {String} channelAddress - Ethereum address of channel
  * @param {Number} amount - number of tokens
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - object containing information about your channel
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#deposit-to-a-channel|Raiden docs}
  */
function deposit(channelAddress, amount, options) {
  validateAddress(channelAddress);
  validateAmount(amount);
  return this.customRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } }, options);
}

/**
  * Join an existing token network.
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address of token
  * @param {Number} depositAmount - Total number of tokens to deposit
  * @param {Number} [numberOfChannels] - Number of channels to open on the network
  * @param {Number} [reserveDepositRatio] - Ratio of tokens deposited that should be reserved for
  * future channel creation. The rest are distributed amongst the {@link numberOfChannels} opened.
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill - no content
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#connecting-to-a-token-network|Raiden docs}
  */
function joinNetwork(
  tokenAddress, depositAmount,
  numberOfChannels = 3, reserveDepositRatio = 0.4,
  options,
) {
  validateAddress(tokenAddress);
  validateAmount(depositAmount);
  return this.customRequest('PUT', `/connections/${tokenAddress}`, {
    body: {
      funds: depositAmount,
      initial_channel_target: numberOfChannels,
      joinable_funds_target: reserveDepositRatio,
    },
  }, options);
}

/**
  * Close all open channels on a token network. The promise will only fulfill once all blockchain
  * calls for closing/settling a channel have completed.
  *
  * Important note. If no arguments are given then raiden will only close and settle channels
  * where your node has received transfers.
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address of token
  * @param {boolean} [onlyReceivingChannels] - true if channels that have received transfers
  * should be closed, false if every channel should be closed.
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {String[]} - Ethereum addresses of all closed channels.
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#leaving-a-token-network|Raiden docs}
  */
function leaveNetwork(tokenAddress, onlyReceivingChannels = true, options) {
  validateAddress(tokenAddress);
  return this.customRequest('DELETE', `/connections/${tokenAddress}`, {
    body: { only_receiving_channels: onlyReceivingChannels },
  }, options);
}

/**
  * Transfer tokens to a recipient.
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address of token
  * @param {String} recipientAddress - Ethereum address of recipient
  * @param {Number} amount - number of tokens to send
  * @param {Number} [transferId] - integer identifier to attach to the transfer
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object} - object containing information about your transfer
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#initiating-a-transfer|Raiden docs}
  */
function sendTokens(
  tokenAddress, recipientAddress,
  amount, transferId, options,
) {
  validateAddress(tokenAddress);
  validateAddress(recipientAddress);
  validateAmount(amount);
  if (transferId && !Number.isInteger(transferId)) throw new Error('token transfer identifier must be an integer');
  return this.customRequest('POST', `/transfers/${tokenAddress}/${recipientAddress}`, {
    body: Object.assign({ amount }, transferId ? { identifier: transferId } : {}),
  }, options);
}

function createTokenSwapBody(tokenSwap, isMaker) {
  const {
    makerToken, makerAmount, takerToken, takerAmount,
  } = tokenSwap;
  validateAddress(makerToken);
  validateAddress(takerToken);
  return isMaker ? {
    role: 'maker',
    sending_token: makerToken,
    sending_amount: makerAmount,
    receiving_token: takerToken,
    receiving_amount: takerAmount,
  } : {
    role: 'taker',
    sending_token: takerToken,
    sending_amount: takerAmount,
    receiving_token: makerToken,
    receiving_amount: makerAmount,
  };
}

/**
  * Request a token swap to atomically exchange two tokens with a specified recipient.
  *
  * @instance
  *
  * @param {Object} tokenSwap - object representing the token swap
  * @param {Number} tokenSwap.identifier - Integer identifier to use for this swap
  * @param {String} [tokenSwap.makerAddress] - Ethereum address of the swap maker
  * @param {String} tokenSwap.makerToken - Ethereum address of token the maker wants to swap
  * @param {Number} tokenSwap.makerAmount - number of tokens the maker wants to swap
  * @param {String} tokenSwap.takerAddress - Ethereum address of the swap taker
  * @param {String} tokenSwap.takerToken - Ethereum address of token the taker will swap
  * @param {Number} tokenSwap.takerAmount - number of tokens the taker will swap
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill - no content
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps|Raiden docs}
  */
function makeTokenSwap(tokenSwap, options) {
  const { identifier, takerAddress } = tokenSwap;
  validateAddress(takerAddress);
  return this.customRequest(
    'PUT',
    `/token_swaps/${takerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, true) },
    options,
  );
}

/**
  * Accept a token swap to atomically exchange two tokens with a specified recipient.
  *
  * @instance
  *
  * @param {Object} tokenSwap - object representing the token swap
  * @param {Number} tokenSwap.identifier - Integer identifier of the swap
  * @param {String} tokenSwap.makerAddress - Ethereum address of the swap maker
  * @param {String} tokenSwap.makerToken - Ethereum address of token the maker wants to swap
  * @param {Number} tokenSwap.makerAmount - number of tokens the maker wants to swap
  * @param {String} [tokenSwap.takerAddress] - Ethereum address of the swap taker
  * @param {String} tokenSwap.takerToken - Ethereum address of token the taker will swap
  * @param {Number} tokenSwap.takerAmount - number of tokens the taker will swap
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill - no content
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps|Raiden docs}
  */
function takeTokenSwap(tokenSwap, options) {
  const { identifier, makerAddress } = tokenSwap;
  validateAddress(makerAddress);
  return this.customRequest(
    'PUT',
    `/token_swaps/${makerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, false) },
    options,
  );
}

function getEvents(node, eventUri, fromBlock = 0, options) {
  if (fromBlock < 0) throw new Error(`block number must not be negative (block: ${fromBlock}`);
  return node.customRequest('GET', url.resolve('/events', eventUri), fromBlock ? { qs: { from_block: fromBlock } } : {}, options);
}

/**
  * Query for registry network events.
  *
  * @instance
  *
  * @param {Number} [fromBlock] - only get events that occurred after this block
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object[]} - array of objects containing information about each event
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-general-network-events|Raiden docs}
  */
function getNetworkEvents(fromBlock, options) {
  return getEvents(this, '/network', fromBlock, options);
}

/**
  * Query for all new channels opened for a token
  *
  * @instance
  *
  * @param {String} tokenAddress - Ethereum address of token
  * @param {Number} [fromBlock] - only get events that occurred after this block
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object[]} - array of objects containing information about each event
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-token-network-events|Raiden docs}
  */
function getTokenEvents(tokenAddress, fromBlock, options) {
  validateAddress(tokenAddress);
  return getEvents(this, `/tokens/${tokenAddress}`, fromBlock, options);
}

/**
  * Query for events tied to a specific channel
  *
  * @instance
  *
  * @param {String} channelAddress - Ethereum address of channel
  * @param {Number} [fromBlock] - only get events that occurred after this block
  * @param {Object} [options] - custom request options
  *
  * @returns {Promise}
  * @fulfill {Object[]} - array of objects containing information about each event
  * @reject {Error} - request error
  * @see {@link https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-channel-events|Raiden docs}
  */
function getChannelEvents(channelAddress, fromBlock, options) {
  validateAddress(channelAddress);
  return getEvents(this, `/channels/${channelAddress}`, fromBlock, options);
}

RaidenClient.localNode = localNode;
RaidenClient.prototype.customRequest = customRequest;
RaidenClient.prototype.getAddress = getAddress;
RaidenClient.prototype.registerToken = registerToken;
RaidenClient.prototype.getRegisteredTokens = getRegisteredTokens;
RaidenClient.prototype.getTokenPartners = getTokenPartners;
RaidenClient.prototype.getChannel = getChannel;
RaidenClient.prototype.getAllChannels = getAllChannels;
RaidenClient.prototype.openChannel = openChannel;
RaidenClient.prototype.closeChannel = closeChannel;
RaidenClient.prototype.settleChannel = settleChannel;
RaidenClient.prototype.deposit = deposit;
RaidenClient.prototype.joinNetwork = joinNetwork;
RaidenClient.prototype.leaveNetwork = leaveNetwork;
RaidenClient.prototype.sendTokens = sendTokens;
RaidenClient.prototype.makeTokenSwap = makeTokenSwap;
RaidenClient.prototype.takeTokenSwap = takeTokenSwap;
RaidenClient.prototype.getNetworkEvents = getNetworkEvents;
RaidenClient.prototype.getTokenEvents = getTokenEvents;
RaidenClient.prototype.getChannelEvents = getChannelEvents;

module.exports = RaidenClient;
