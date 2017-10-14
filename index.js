const url = require('url');
const request = require('request-promise-any');

const DEFAULT_RPC_HOST = 'http://127.0.0.1:5001/';
const DEFAULT_API_VERSION = 1;

const DEFAULT_OPTIONS = {
  rpcHost: DEFAULT_RPC_HOST,
  apiVersion: DEFAULT_API_VERSION,
};

function mergeOptions(...options) {
  const merged = Object.assign({}, DEFAULT_OPTIONS, ...options);
  merged.baseUrl = merged.baseUrl || url.resolve(merged.rpcHost, `/api/${merged.apiVersion}`);
  delete merged.rpcHost;
  delete merged.apiVersion;
  return merged;
}

function raiden(method, uri, ...options) {
  return request(mergeOptions({
    method,
    uri,
    json: true,
  }, ...options));
}

function getAddress(options) {
  return raiden('GET', '/address', options).then(data => data.our_address);
}

function registerToken(tokenAddress, options) {
  return raiden('PUT', `/tokens/${tokenAddress}`, options).then(data => data.channel_manager_address);
}

function getRegisteredTokens(options) {
  return raiden('GET', '/tokens', options);
}

function getTokenPartners(tokenAddress, options) {
  return raiden('GET', `/tokens/${tokenAddress}/partners`, options).then(partners =>
    partners.map(data => ({
      partner_address: data.partner_address,
      channel_address: data.channel.split('/').pop(), // extract address from channel uri
    })));
}

function getChannel(channelAddress, options) {
  return raiden('GET', `/channels/${channelAddress}`, options);
}

function getAllChannels(options) {
  return raiden('GET', '/channels', options);
}

function openChannel(partnerAddress, tokenAddress, initialBalance, settleTimeout, options) {
  return raiden('PUT', '/channels', {
    body: {
      partner_address: partnerAddress,
      token_address: tokenAddress,
      balance: initialBalance,
      settle_timeout: settleTimeout,
    },
    options,
  });
}

function closeChannel(channelAddress, options) {
  return raiden('PATCH', `/channels/${channelAddress}`, { body: { state: 'closed' } }, options);
}

function settleChannel(channelAddress, options) {
  return raiden('PATCH', `/channels/${channelAddress}`, { body: { state: 'settled' } }, options);
}

function validateDeposit(amount) {
  if (amount <= 0) throw new Error(`Deposit and transfer amounts must not be negative or zero (amount: ${amount})`);
}

function deposit(channelAddress, amount, options) {
  validateDeposit(amount);
  return raiden('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } }, options);
}

function joinNetwork(
  tokenAddress, depositAmount,
  numberOfChannels = 3, reserveDepositRatio = 0.4,
  options,
) {
  validateDeposit(depositAmount);
  return raiden('PUT', `/connection/${tokenAddress}`, {
    body: {
      funds: depositAmount,
      initial_channel_target: numberOfChannels,
      joinable_funds_target: reserveDepositRatio,
    },
  }, options);
}

function leaveNetwork(tokenAddress, onlyReceivingChannels = true, options) {
  return raiden('DELETE', `/connection/${tokenAddress}`, { body: { only_receiving_channels: onlyReceivingChannels } }, options);
}

function sendTokens(tokenAddress, recipientAddress, amount, transferId, options) {
  validateDeposit(amount);
  if (transferId && !Number.isInteger(transferId)) throw new Error('token transfer identifier must be an integer');
  return raiden('POST', `/transfers/${tokenAddress}/${recipientAddress}`, {
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

function makeTokenSwap(tokenSwap, options) {
  const { identifier, takerAddress } = tokenSwap;
  return raiden(
    'PUT',
    `/token_swaps/${takerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, true) },
    options,
  );
}

function takeTokenSwap(tokenSwap, options) {
  const { identifier, makerAddress } = tokenSwap;
  return raiden(
    'PUT',
    `/token_swaps/${makerAddress}/${identifier}`,
    { body: createTokenSwapBody(tokenSwap, false) },
    options,
  );
}

function getEvents(relativeUri, fromBlock = 0, options) {
  if (fromBlock < 0) throw new Error(`block number must not be negative (block: ${fromBlock}`);
  return raiden('GET', url.resolve('/events', relativeUri), fromBlock ? { qs: { from_block: fromBlock } } : {}, options);
}

function getNetworkEvents(fromBlock, options) {
  return getEvents('/network', fromBlock, options);
}

function getTokenEvents(tokenAddress, fromBlock, options) {
  return getEvents(`/tokens/${tokenAddress}`, fromBlock, options);
}

function getChannelEvents(channelAddress, fromBlock, options) {
  return getEvents(`/channels/${channelAddress}`, fromBlock, options);
}

module.exports = {
  raiden,
  getAddress,
  registerToken,
  getRegisteredTokens,
  getTokenPartners,
  getChannel,
  getAllChannels,
  openChannel,
  closeChannel,
  settleChannel,
  deposit,
  joinNetwork,
  leaveNetwork,
  sendTokens,
  makeTokenSwap,
  takeTokenSwap,
  getNetworkEvents,
  getTokenEvents,
  getChannelEvents,
}
