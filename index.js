const url = require('url');
const request = require('request-promise-any');
const ethAddress = require('ethereum-address');

const DEFAULT_RPC_HOST = 'http://127.0.0.1:5001/';
const DEFAULT_API_VERSION = '1';

/**
 * Represents a raiden node. Holds information used to connect to it's rpc interface.
 * @constructor
 * @param {string} rpcHost - the full raiden node hostname
 * @param {string} apiVersion - the raiden api version
 */
function RaidenNode(rpcHost = DEFAULT_RPC_HOST, apiVersion = DEFAULT_API_VERSION) {
  this.baseUrl = url.resolve(rpcHost, `/api/${apiVersion}`);
}

function getLocalNode() {
  return new RaidenNode();
}

function validateAmount(amount) {
  if (amount <= 0) throw new Error(`Deposit and transfer amounts must not be negative or zero (amount: ${amount})`);
}

function validateAddress(address) {
  if (!ethAddress.isAddress(address)) throw new Error(`Expected a valid ethereum address (got: ${address})`);
}

function raidenRequest(method, uri, ...options) {
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

function getAddress(options) {
  return this.raidenRequest('GET', '/address', options).then(data => data.our_address);
}

function registerToken(tokenAddress, options) {
  validateAddress(tokenAddress);
  return this.raidenRequest('PUT', `/tokens/${tokenAddress}`, options).then(data => data.channel_manager_address);
}

function getRegisteredTokens(options) {
  return this.raidenRequest('GET', '/tokens', options);
}

function getTokenPartners(tokenAddress, options) {
  validateAddress(tokenAddress);
  return this.raidenRequest('GET', `/tokens/${tokenAddress}/partners`, options).then(partners =>
    partners.map(data => ({
      partner_address: data.partner_address,
      channel_address: data.channel.split('/').pop(), // extract address from channel uri
    })));
}

function getChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.raidenRequest('GET', `/channels/${channelAddress}`, options);
}

function getAllChannels(options) {
  return this.raidenRequest('GET', '/channels', options);
}

function openChannel(
  partnerAddress, tokenAddress, initialBalance,
  settleTimeout, revealTimeout, options,
) {
  validateAddress(partnerAddress);
  validateAddress(tokenAddress);
  return this.raidenRequest('PUT', '/channels', {
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

function closeChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'closed' } }, options);
}

function settleChannel(channelAddress, options) {
  validateAddress(channelAddress);
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'settled' } }, options);
}

function deposit(channelAddress, amount, options) {
  validateAddress(channelAddress);
  validateAmount(amount);
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } }, options);
}

function joinNetwork(
  tokenAddress, depositAmount,
  numberOfChannels = 3, reserveDepositRatio = 0.4,
  options,
) {
  validateAddress(tokenAddress);
  validateAmount(depositAmount);
  return this.raidenRequest('PUT', `/connections/${tokenAddress}`, {
    body: {
      funds: depositAmount,
      initial_channel_target: numberOfChannels,
      joinable_funds_target: reserveDepositRatio,
    },
  }, options);
}

function leaveNetwork(tokenAddress, onlyReceivingChannels = true, options) {
  validateAddress(tokenAddress);
  return this.raidenRequest('DELETE', `/connections/${tokenAddress}`, {
    body: { only_receiving_channels: onlyReceivingChannels },
  }, options);
}

function sendTokens(
  tokenAddress, recipientAddress,
  amount, transferId, options,
) {
  validateAddress(tokenAddress);
  validateAddress(recipientAddress);
  validateAmount(amount);
  if (transferId && !Number.isInteger(transferId)) throw new Error('token transfer identifier must be an integer');
  return this.raidenRequest('POST', `/transfers/${tokenAddress}/${recipientAddress}`, {
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

function makeTokenSwap(tokenSwap, options) {
  const { identifier, takerAddress } = tokenSwap;
  validateAddress(takerAddress);
  return this.raidenRequest(
    'PUT',
    `/token_swaps/${takerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, true) },
    options,
  );
}

function takeTokenSwap(tokenSwap, options) {
  const { identifier, makerAddress } = tokenSwap;
  validateAddress(makerAddress);
  return this.raidenRequest(
    'PUT',
    `/token_swaps/${makerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, false) },
    options,
  );
}

function getEvents(node, eventUri, fromBlock = 0, options) {
  if (fromBlock < 0) throw new Error(`block number must not be negative (block: ${fromBlock}`);
  return node.raidenRequest('GET', url.resolve('/events', eventUri), fromBlock ? { qs: { from_block: fromBlock } } : {}, options);
}

function getNetworkEvents(fromBlock, options) {
  return getEvents(this, '/network', fromBlock, options);
}

function getTokenEvents(tokenAddress, fromBlock, options) {
  validateAddress(tokenAddress);
  return getEvents(this, `/tokens/${tokenAddress}`, fromBlock, options);
}

function getChannelEvents(channelAddress, fromBlock, options) {
  validateAddress(channelAddress);
  return getEvents(this, `/channels/${channelAddress}`, fromBlock, options);
}

RaidenNode.getLocalNode = getLocalNode;
RaidenNode.prototype.raidenRequest = raidenRequest;
RaidenNode.prototype.getAddress = getAddress;
RaidenNode.prototype.registerToken = registerToken;
RaidenNode.prototype.getRegisteredTokens = getRegisteredTokens;
RaidenNode.prototype.getTokenPartners = getTokenPartners;
RaidenNode.prototype.getChannel = getChannel;
RaidenNode.prototype.getAllChannels = getAllChannels;
RaidenNode.prototype.openChannel = openChannel;
RaidenNode.prototype.closeChannel = closeChannel;
RaidenNode.prototype.settleChannel = settleChannel;
RaidenNode.prototype.deposit = deposit;
RaidenNode.prototype.joinNetwork = joinNetwork;
RaidenNode.prototype.leaveNetwork = leaveNetwork;
RaidenNode.prototype.sendTokens = sendTokens;
RaidenNode.prototype.makeTokenSwap = makeTokenSwap;
RaidenNode.prototype.takeTokenSwap = takeTokenSwap;
RaidenNode.prototype.getNetworkEvents = getNetworkEvents;
RaidenNode.prototype.getTokenEvents = getTokenEvents;
RaidenNode.prototype.getChannelEvents = getChannelEvents;

module.exports = {
  RaidenNode,
  getLocalNode,
};
