<a name="module_raiden-rpc"></a>

## raiden-rpc
A module for interacting with RPC api of a Raiden network node.

**Installation**
```
npm install raiden-rpc
```

**Example**  
Require the library
```javascript
var RaidenNode = require('raiden-rpc');
```
Create a new raiden node instance. See below for possible options.
```javascript
// Quick localhost development
var localNode = RaidenNode.newLocalNode(); // Uses ([DEFAULT_RPC_HOST](DEFAULT_RPC_HOST))
// Custom hostname
var raidenNode = new RaidenNode('http://192.168.1.124:5004');
```

* [raiden-rpc](#module_raiden-rpc)
    * [RaidenNode](#exp_module_raiden-rpc--RaidenNode) ⏏
        * [new RaidenNode(rpcHost, apiVersion)](#new_module_raiden-rpc--RaidenNode_new)
        * _instance_
            * [.raidenRequest(method, uri, [...options])](#module_raiden-rpc--RaidenNode+raidenRequest)
            * [.getAddress([options])](#module_raiden-rpc--RaidenNode+getAddress) ⇒ <code>Promise</code>
            * [.registerToken(tokenAddress, [options])](#module_raiden-rpc--RaidenNode+registerToken) ⇒ <code>Promise</code>
            * [.getRegisteredTokens([options])](#module_raiden-rpc--RaidenNode+getRegisteredTokens) ⇒ <code>Promise</code>
            * [.getTokenPartners(tokenAddress, [options])](#module_raiden-rpc--RaidenNode+getTokenPartners) ⇒ <code>Promise</code>
            * [.getChannel(channelAddress, [options])](#module_raiden-rpc--RaidenNode+getChannel) ⇒ <code>Promise</code>
            * [.getAllChannels([options])](#module_raiden-rpc--RaidenNode+getAllChannels) ⇒ <code>Promise</code>
            * [.openChannel(partnerAddress, tokenAddress, initialBalance, [settleTimeout], [revealTimeout], [options])](#module_raiden-rpc--RaidenNode+openChannel) ⇒ <code>Promise</code>
            * [.closeChannel(channelAddress, [options])](#module_raiden-rpc--RaidenNode+closeChannel) ⇒ <code>Promise</code>
            * [.settleChannel(channelAddress, [options])](#module_raiden-rpc--RaidenNode+settleChannel) ⇒ <code>Promise</code>
            * [.deposit(channelAddress, amount, [options])](#module_raiden-rpc--RaidenNode+deposit) ⇒ <code>Promise</code>
            * [.joinNetwork(tokenAddress, depositAmount, [numberOfChannels], [reserveDepositRatio], [options])](#module_raiden-rpc--RaidenNode+joinNetwork) ⇒ <code>Promise</code>
            * [.leaveNetwork(tokenAddress, [onlyReceivingChannels], [options])](#module_raiden-rpc--RaidenNode+leaveNetwork) ⇒ <code>Promise</code>
            * [.sendTokens(tokenAddress, recipientAddress, amount, [transferId], [options])](#module_raiden-rpc--RaidenNode+sendTokens) ⇒ <code>Promise</code>
            * [.makeTokenSwap(tokenSwap, [options])](#module_raiden-rpc--RaidenNode+makeTokenSwap) ⇒ <code>Promise</code>
            * [.takeTokenSwap(tokenSwap, [options])](#module_raiden-rpc--RaidenNode+takeTokenSwap) ⇒ <code>Promise</code>
            * [.getNetworkEvents([fromBlock], [options])](#module_raiden-rpc--RaidenNode+getNetworkEvents) ⇒ <code>Promise</code>
            * [.getTokenEvents(tokenAddress, [fromBlock], [options])](#module_raiden-rpc--RaidenNode+getTokenEvents) ⇒ <code>Promise</code>
            * [.getChannelEvents(channelAddress, [fromBlock], [options])](#module_raiden-rpc--RaidenNode+getChannelEvents) ⇒ <code>Promise</code>
        * _static_
            * [.getLocalNode()](#module_raiden-rpc--RaidenNode.getLocalNode) ⇒ <code>RaidenNode</code>
        * _inner_
            * [~DEFAULT_RPC_HOST](#module_raiden-rpc--RaidenNode..DEFAULT_RPC_HOST) : <code>string</code>

<a name="exp_module_raiden-rpc--RaidenNode"></a>

### RaidenNode ⏏
**Kind**: Exported class  
**Properties**

| Name | Description |
| --- | --- |
| baseUrl | The baseUrl used to perform requests. |

<a name="new_module_raiden-rpc--RaidenNode_new"></a>

#### new RaidenNode(rpcHost, apiVersion)
A class that represents a raiden node. Holds information used to connect to it's rpc interface.

**Params**

- rpcHost <code>string</code> - the full raiden node hostname
- apiVersion <code>string</code> - the raiden api version

<a name="module_raiden-rpc--RaidenNode+raidenRequest"></a>

#### raidenNode.raidenRequest(method, uri, [...options])
Performs a Raiden RPC request.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Params**

- method <code>string</code> - request method to use
- uri <code>string</code> - the api endpoint to call (relative to [RaidenNode#baseUrl](RaidenNode#baseUrl))
- [...options] <code>Object</code> - custom request options

**Example**  
```javascript
myNode.raidenRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } })
```
<a name="module_raiden-rpc--RaidenNode+getAddress"></a>

#### raidenNode.getAddress([options]) ⇒ <code>Promise</code>
Retrieves the Ethereum address associated with the node

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>string</code> - Ethereum address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-your-address)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+registerToken"></a>

#### raidenNode.registerToken(tokenAddress, [options]) ⇒ <code>Promise</code>
Registers a token by deploying a channel manager.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>string</code> - channel manager Ethereum address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#registering-a-token)  
**Params**

- tokenAddress <code>string</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getRegisteredTokens"></a>

#### raidenNode.getRegisteredTokens([options]) ⇒ <code>Promise</code>
Get a list of addresses of all registered tokens.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>string[]</code> - array of Ethereum addresses  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-traded-tokens)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getTokenPartners"></a>

#### raidenNode.getTokenPartners(tokenAddress, [options]) ⇒ <code>Promise</code>
Get a list of all partners you have non-settled channels with.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object[]</code> - array of objects containing channel_address and partner_address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-partners-for-a-token)  
**Params**

- tokenAddress <code>string</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getChannel"></a>

#### raidenNode.getChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Query information about your channel.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-a-specific-channel)  
**Params**

- channelAddress <code>string</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getAllChannels"></a>

#### raidenNode.getAllChannels([options]) ⇒ <code>Promise</code>
Get a list of all non-settled channels.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about your channels  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-channels)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+openChannel"></a>

#### raidenNode.openChannel(partnerAddress, tokenAddress, initialBalance, [settleTimeout], [revealTimeout], [options]) ⇒ <code>Promise</code>
Creates a channel with a partner.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - objects containing information about your newly created channel  
**Reject**: <code>Error</code> - request error  
**See**

- [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#open-channel)
- [settleTimeout](https://raiden-network.readthedocs.io/en/stable/spec.html#channel-closing-and-settlement)
- [revealTimeout](https://raiden-network.readthedocs.io/en/stable/spec.html#safety-of-mediated-transfers)

**Params**

- partnerAddress <code>string</code> - Ethereum address of other Raiden node
- tokenAddress <code>string</code> - Ethereum address of token that will be transferred in
this channel
- initialBalance <code>number</code> - Tokens to initially deposit
- [settleTimeout] <code>number</code> - Number of blocks to wait for settlement after closing
this channel
- [revealTimeout] <code>number</code> - Number of blocks to use for reveal timeout
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+closeChannel"></a>

#### raidenNode.closeChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Closes an open channel.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#close-channel)  
**Params**

- channelAddress <code>string</code> - Ethereum address of channel
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+settleChannel"></a>

#### raidenNode.settleChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Settle a closed channel.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#settle-channel)  
**Params**

- channelAddress <code>string</code> - Ethereum address of channel
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+deposit"></a>

#### raidenNode.deposit(channelAddress, amount, [options]) ⇒ <code>Promise</code>
Deposit more tokens into a channel. Token to deposit was specified on channel creation.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#deposit-to-a-channel)  
**Params**

- channelAddress <code>string</code> - Ethereum address of channel
- amount <code>number</code> - number of tokens
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+joinNetwork"></a>

#### raidenNode.joinNetwork(tokenAddress, depositAmount, [numberOfChannels], [reserveDepositRatio], [options]) ⇒ <code>Promise</code>
Join an existing token network.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#connecting-to-a-token-network)  
**Params**

- tokenAddress <code>string</code> - Ethereum address of token
- depositAmount <code>number</code> - Total number of tokens to deposit
- [numberOfChannels] <code>number</code> <code> = 3</code> - Number of channels to open on the network
- [reserveDepositRatio] <code>number</code> <code> = 0.4</code> - Ratio of tokens deposited that should be reserved for
future channel creation. The rest are distributed amongst the [numberOfChannels](numberOfChannels) opened.
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+leaveNetwork"></a>

#### raidenNode.leaveNetwork(tokenAddress, [onlyReceivingChannels], [options]) ⇒ <code>Promise</code>
Close all open channels on a token network. The promise will only fulfill once all blockchain
calls for closing/settling a channel have completed.

Important note. If no arguments are given then raiden will only close and settle channels
where your node has received transfers.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>string[]</code> - Ethereum addresses of all closed channels.  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#leaving-a-token-network)  
**Params**

- tokenAddress <code>string</code> - Ethereum address of token
- [onlyReceivingChannels] <code>boolean</code> <code> = true</code> - true if channels that have received transfers
should be closed, false if every channel should be closed.
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+sendTokens"></a>

#### raidenNode.sendTokens(tokenAddress, recipientAddress, amount, [transferId], [options]) ⇒ <code>Promise</code>
Transfer tokens to a recipient.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object</code> - object containing information about your transfer  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#initiating-a-transfer)  
**Params**

- tokenAddress <code>string</code> - Ethereum address of token
- recipientAddress <code>string</code> - Ethereum address of recipient
- amount <code>number</code> - number of tokens to send
- [transferId] <code>number</code> - integer identifier to attach to the transfer
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+makeTokenSwap"></a>

#### raidenNode.makeTokenSwap(tokenSwap, [options]) ⇒ <code>Promise</code>
Request a token swap to atomically exchange two tokens with a specified recipient.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps)  
**Params**

- tokenSwap <code>Object</code> - object representing the token swap
    - .identifier <code>number</code> - Integer identifier to use for this swap
    - [.makerAddress] <code>string</code> - Ethereum address of the swap maker
    - .makerToken <code>string</code> - Ethereum address of token the maker wants to swap
    - .makerAmount <code>number</code> - number of tokens the maker wants to swap
    - .takerAddress <code>string</code> - Ethereum address of the swap taker
    - .takerToken <code>string</code> - Ethereum address of token the taker will swap
    - .takerAmount <code>number</code> - number of tokens the taker will swap
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+takeTokenSwap"></a>

#### raidenNode.takeTokenSwap(tokenSwap, [options]) ⇒ <code>Promise</code>
Accept a token swap to atomically exchange two tokens with a specified recipient.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps)  
**Params**

- tokenSwap <code>Object</code> - object representing the token swap
    - .identifier <code>number</code> - Integer identifier of the swap
    - .makerAddress <code>string</code> - Ethereum address of the swap maker
    - .makerToken <code>string</code> - Ethereum address of token the maker wants to swap
    - .makerAmount <code>number</code> - number of tokens the maker wants to swap
    - [.takerAddress] <code>string</code> - Ethereum address of the swap taker
    - .takerToken <code>string</code> - Ethereum address of token the taker will swap
    - .takerAmount <code>number</code> - number of tokens the taker will swap
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getNetworkEvents"></a>

#### raidenNode.getNetworkEvents([fromBlock], [options]) ⇒ <code>Promise</code>
Query for registry network events.

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-general-network-events)  
**Params**

- [fromBlock] <code>number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getTokenEvents"></a>

#### raidenNode.getTokenEvents(tokenAddress, [fromBlock], [options]) ⇒ <code>Promise</code>
Query for all new channels opened for a token

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-token-network-events)  
**Params**

- tokenAddress <code>string</code> - Ethereum address of token
- [fromBlock] <code>number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode+getChannelEvents"></a>

#### raidenNode.getChannelEvents(channelAddress, [fromBlock], [options]) ⇒ <code>Promise</code>
Query for events tied to a specific channel

**Kind**: instance method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-channel-events)  
**Params**

- channelAddress <code>string</code> - Ethereum address of channel
- [fromBlock] <code>number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenNode.getLocalNode"></a>

#### RaidenNode.getLocalNode() ⇒ <code>RaidenNode</code>
Returns a new instance of [RaideNode](RaideNode) connecting to the default localhost node.

**Kind**: static method of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
<a name="module_raiden-rpc--RaidenNode..DEFAULT_RPC_HOST"></a>

#### RaidenNode~DEFAULT_RPC_HOST : <code>string</code>
**Kind**: inner constant of [<code>RaidenNode</code>](#exp_module_raiden-rpc--RaidenNode)  
**Default**: <code>&quot;http://127.0.0.1:5001/&quot;</code>  
