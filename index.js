const url = require('url');
const request = require('request-promise-any');

const DEFAULT_RPC_HOST = 'http://127.0.0.1:5001/';
const DEFAULT_API_VERSION = 1;

function RaidenNode(rpcHost = DEFAULT_RPC_HOST, apiVersion = DEFAULT_API_VERSION) {
  this.baseUrl = url.resolve(rpcHost, `/api/${apiVersion}`);
}

function getLocalNode() {
  return new RaidenNode();
}
RaidenNode.getLocalNode = getLocalNode;

function validateAmount(amount) {
  if (amount <= 0) throw new Error(`Deposit and transfer amounts must not be negative or zero (amount: ${amount})`);
}

RaidenNode.prototype.raidenRequest = function(method, uri, ...options) {
  return request(Object.assign({
    method,
    uri,
    baseUrl: this.baseUrl,
    json: true,
    headers: {
      'content-type': 'application/json'
    },
  }, ...options));
}

RaidenNode.prototype.getAddress = function(options) {
  return this.raidenRequest('GET', '/address', options).then(data => data.our_address);
}

RaidenNode.prototype.registerToken = function(tokenAddress, options) {
  return this.raidenRequest('PUT', `/tokens/${tokenAddress}`, options).then(data => data.channel_manager_address);
}

RaidenNode.prototype.getRegisteredTokens = function(options) {
  return this.raidenRequest('GET', '/tokens', options);
}

RaidenNode.prototype.getTokenPartners = function(tokenAddress, options) {
  return this.raidenRequest('GET', `/tokens/${tokenAddress}/partners`, options).then(partners =>
    partners.map(data => ({
      partner_address: data.partner_address,
      channel_address: data.channel.split('/').pop(), // extract address from channel uri
    })));
}

RaidenNode.prototype.getChannel = function(channelAddress, options) {
  return this.raidenRequest('GET', `/channels/${channelAddress}`, options);
}

RaidenNode.prototype.getAllChannels = function(options) {
  return this.raidenRequest('GET', '/channels', options);
}

RaidenNode.prototype.openChannel = function(partnerAddress, tokenAddress, initialBalance, settleTimeout, options) {
  return this.raidenRequest('PUT', '/channels', {
    body: {
      partner_address: partnerAddress,
      token_address: tokenAddress,
      balance: initialBalance,
      settle_timeout: settleTimeout,
    },
    options,
  });
}

RaidenNode.prototype.closeChannel = function(channelAddress, options) {
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'closed' } }, options);
}

RaidenNode.prototype.settleChannel = function(channelAddress, options) {
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { state: 'settled' } }, options);
}

RaidenNode.prototype.deposit = function(channelAddress, amount, options) {
  validateAmount(amount);
  return this.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } }, options);
}

RaidenNode.prototype.joinNetwork = function(
  tokenAddress, depositAmount,
  numberOfChannels = 3, reserveDepositRatio = 0.4,
  options,
) {
  validateAmount(depositAmount);
  return this.raidenRequest('PUT', `/connections/${tokenAddress}`, {
    body: {
      funds: depositAmount,
      initial_channel_target: numberOfChannels,
      joinable_funds_target: reserveDepositRatio,
    },
  }, options);
}

RaidenNode.prototype.leaveNetwork = function(tokenAddress, onlyReceivingChannels = true, options) {
  return this.raidenRequest('DELETE', `/connections/${tokenAddress}`, { body: { only_receiving_channels: onlyReceivingChannels } }, options);
}

RaidenNode.prototype.sendTokens = function(tokenAddress, recipientAddress, amount, transferId, options) {
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

RaidenNode.prototype.makeTokenSwap = function(tokenSwap, options) {
  const { identifier, takerAddress } = tokenSwap;
  return this.raidenRequest(
    'PUT',
    `/token_swaps/${takerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, true) },
    options,
  );
}

RaidenNode.prototype.takeTokenSwap = function(tokenSwap, options) {
  const { identifier, makerAddress } = tokenSwap;
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

RaidenNode.prototype.getNetworkEvents = function(fromBlock, options) {
  return getEvents(this, '/network', fromBlock, options);
}

RaidenNode.prototype.getTokenEvents = function(tokenAddress, fromBlock, options) {
  return getEvents(this, `/tokens/${tokenAddress}`, fromBlock, options);
}

RaidenNode.prototype.getChannelEvents = function(channelAddress, fromBlock, options) {
  return getEvents(this, `/channels/${channelAddress}`, fromBlock, options);
}

module.exports = {
  RaidenNode,
  getLocalNode,
};
