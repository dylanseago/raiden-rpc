# Raiden RPC
A module for interacting with a Raiden network node over RPC.

**Installation**
```
npm install raiden-rpc
```  
**Example**  
Require the library
```javascript
var RaidenClient = require('raiden-rpc');
```
Create a new raiden instance for a specific node. See below for possible options.
```javascript
// Quick localhost development
var localNode = RaidenClient.localNode(); // Uses DEFAULT_RPC_HOST
// Custom hostname
var myNode = new RaidenClient('http://192.168.1.124:5004');
```
Join a token network and transfer tokens to another node
```javascript
const testnetToken = '0x0f114a1e9db192502e7856309cc899952b3db1ed';
const recipientAddress = '0x61c808d82a3ac53231750dadc13c777b59310bd9';
// Retrieve our own address as sanity check
myNode.getAddress()
  // Deposit 100 testnet tokens, 20 amongst 3 channels, 40 reserved for future channels
  .then(myAddress => myNode.joinNetwork(testnetToken, 100, 3, 0.4))
  // Promise resolves after all channels opened
  // Send 8 tokens to recipient with transfer ID 1337
  .then(() => myNode.sendTokens(testnetToken, recipientAddress, 8, 1337))
  // Promise resolves after transfer succeeds or fails
  // Leave the token network
  .then(() => myNode.leaveNetwork(testnetToken));
```
**Overview**  
* [raiden-rpc](#module_raiden-rpc)
    * [RaidenClient](#exp_module_raiden-rpc--RaidenClient) ⏏
        * [new RaidenClient([rpcHost], [apiVersion])](#new_module_raiden-rpc--RaidenClient_new)
        * _instance_
            * [.customRequest(method, uri, [...options])](#module_raiden-rpc--RaidenClient+customRequest)
            * [.getAddress([options])](#module_raiden-rpc--RaidenClient+getAddress) ⇒ <code>Promise</code>
            * [.registerToken(tokenAddress, [options])](#module_raiden-rpc--RaidenClient+registerToken) ⇒ <code>Promise</code>
            * [.getRegisteredTokens([options])](#module_raiden-rpc--RaidenClient+getRegisteredTokens) ⇒ <code>Promise</code>
            * [.getTokenPartners(tokenAddress, [options])](#module_raiden-rpc--RaidenClient+getTokenPartners) ⇒ <code>Promise</code>
            * [.getChannel(channelAddress, [options])](#module_raiden-rpc--RaidenClient+getChannel) ⇒ <code>Promise</code>
            * [.getAllChannels([options])](#module_raiden-rpc--RaidenClient+getAllChannels) ⇒ <code>Promise</code>
            * [.openChannel(partnerAddress, tokenAddress, initialBalance, [settleTimeout], [revealTimeout], [options])](#module_raiden-rpc--RaidenClient+openChannel) ⇒ <code>Promise</code>
            * [.closeChannel(channelAddress, [options])](#module_raiden-rpc--RaidenClient+closeChannel) ⇒ <code>Promise</code>
            * [.settleChannel(channelAddress, [options])](#module_raiden-rpc--RaidenClient+settleChannel) ⇒ <code>Promise</code>
            * [.deposit(channelAddress, amount, [options])](#module_raiden-rpc--RaidenClient+deposit) ⇒ <code>Promise</code>
            * [.joinNetwork(tokenAddress, depositAmount, [numberOfChannels], [reserveDepositRatio], [options])](#module_raiden-rpc--RaidenClient+joinNetwork) ⇒ <code>Promise</code>
            * [.leaveNetwork(tokenAddress, [onlyReceivingChannels], [options])](#module_raiden-rpc--RaidenClient+leaveNetwork) ⇒ <code>Promise</code>
            * [.sendTokens(tokenAddress, recipientAddress, amount, [transferId], [options])](#module_raiden-rpc--RaidenClient+sendTokens) ⇒ <code>Promise</code>
            * [.makeTokenSwap(tokenSwap, [options])](#module_raiden-rpc--RaidenClient+makeTokenSwap) ⇒ <code>Promise</code>
            * [.takeTokenSwap(tokenSwap, [options])](#module_raiden-rpc--RaidenClient+takeTokenSwap) ⇒ <code>Promise</code>
            * [.getNetworkEvents([fromBlock], [options])](#module_raiden-rpc--RaidenClient+getNetworkEvents) ⇒ <code>Promise</code>
            * [.getTokenEvents(tokenAddress, [fromBlock], [options])](#module_raiden-rpc--RaidenClient+getTokenEvents) ⇒ <code>Promise</code>
            * [.getChannelEvents(channelAddress, [fromBlock], [options])](#module_raiden-rpc--RaidenClient+getChannelEvents) ⇒ <code>Promise</code>
        * _static_
            * [.localNode()](#module_raiden-rpc--RaidenClient.localNode) ⇒ <code>Raiden</code>
        * _inner_
            * [~DEFAULT_RPC_HOST](#module_raiden-rpc--RaidenClient..DEFAULT_RPC_HOST) : <code>String</code>

## See also
- [Full Documentation](./api.md)
- [Raiden documentation](https://raiden-network.readthedocs.io)
