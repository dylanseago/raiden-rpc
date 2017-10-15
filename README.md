# Raiden network RPC wrapper for node
A convenient nodejs interface for interacting with the raiden RPC api.

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
var localNode = RaidenClient.localNode(); // Uses ([DEFAULT_RPC_HOST](./api.md/#module_raiden-rpc--RaidenClient..DEFAULT_RPC_HOST))
// Custom hostname
var myNode = new RaidenClient('http://192.168.1.124:5004');
```

** Overview **
* [raiden-rpc](./api.md/#module_raiden-rpc)
    * [RaidenClient](./api.md/#exp_module_raiden-rpc--RaidenClient) ⏏
        * [new RaidenClient([rpcHost], [apiVersion])](./api.md/#new_module_raiden-rpc--RaidenClient_new)
        * _instance_
            * [.customRequest(method, uri, [...options])](./api.md/#module_raiden-rpc--RaidenClient+customRequest)
            * [.getAddress([options])](./api.md/#module_raiden-rpc--RaidenClient+getAddress) ⇒ <code>Promise</code>
            * [.registerToken(tokenAddress, [options])](./api.md/#module_raiden-rpc--RaidenClient+registerToken) ⇒ <code>Promise</code>
            * [.getRegisteredTokens([options])](./api.md/#module_raiden-rpc--RaidenClient+getRegisteredTokens) ⇒ <code>Promise</code>
            * [.getTokenPartners(tokenAddress, [options])](./api.md/#module_raiden-rpc--RaidenClient+getTokenPartners) ⇒ <code>Promise</code>
            * [.getChannel(channelAddress, [options])](./api.md/#module_raiden-rpc--RaidenClient+getChannel) ⇒ <code>Promise</code>
            * [.getAllChannels([options])](./api.md/#module_raiden-rpc--RaidenClient+getAllChannels) ⇒ <code>Promise</code>
            * [.openChannel(partnerAddress, tokenAddress, initialBalance, [settleTimeout], [revealTimeout], [options])](./api.md/#module_raiden-rpc--RaidenClient+openChannel) ⇒ <code>Promise</code>
            * [.closeChannel(channelAddress, [options])](./api.md/#module_raiden-rpc--RaidenClient+closeChannel) ⇒ <code>Promise</code>
            * [.settleChannel(channelAddress, [options])](./api.md/#module_raiden-rpc--RaidenClient+settleChannel) ⇒ <code>Promise</code>
            * [.deposit(channelAddress, amount, [options])](./api.md/#module_raiden-rpc--RaidenClient+deposit) ⇒ <code>Promise</code>
            * [.joinNetwork(tokenAddress, depositAmount, [numberOfChannels], [reserveDepositRatio], [options])](./api.md/#module_raiden-rpc--RaidenClient+joinNetwork) ⇒ <code>Promise</code>
            * [.leaveNetwork(tokenAddress, [onlyReceivingChannels], [options])](./api.md/#module_raiden-rpc--RaidenClient+leaveNetwork) ⇒ <code>Promise</code>
            * [.sendTokens(tokenAddress, recipientAddress, amount, [transferId], [options])](./api.md/#module_raiden-rpc--RaidenClient+sendTokens) ⇒ <code>Promise</code>
            * [.makeTokenSwap(tokenSwap, [options])](./api.md/#module_raiden-rpc--RaidenClient+makeTokenSwap) ⇒ <code>Promise</code>
            * [.takeTokenSwap(tokenSwap, [options])](./api.md/#module_raiden-rpc--RaidenClient+takeTokenSwap) ⇒ <code>Promise</code>
            * [.getNetworkEvents([fromBlock], [options])](./api.md/#module_raiden-rpc--RaidenClient+getNetworkEvents) ⇒ <code>Promise</code>
            * [.getTokenEvents(tokenAddress, [fromBlock], [options])](./api.md/#module_raiden-rpc--RaidenClient+getTokenEvents) ⇒ <code>Promise</code>
            * [.getChannelEvents(channelAddress, [fromBlock], [options])](./api.md/#module_raiden-rpc--RaidenClient+getChannelEvents) ⇒ <code>Promise</code>
        * _static_
            * [.localNode()](./api.md/#module_raiden-rpc--RaidenClient.localNode) ⇒ <code>Raiden</code>
        * _inner_
            * [~DEFAULT_RPC_HOST](./api.md/#module_raiden-rpc--RaidenClient..DEFAULT_RPC_HOST) : <code>String</code>

[Full API documentation](./api.md)

## See also
- [Raiden documentation](https://raiden-network.readthedocs.io)
