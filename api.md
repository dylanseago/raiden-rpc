<a name="module_raiden-rpc"></a>

## raiden-rpc
A module for interacting with a Raiden network node over RPC.

**Author**: Dylan Seago

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

<a name="exp_module_raiden-rpc--RaidenClient"></a>

### RaidenClient ⏏
**Kind**: Exported class  
**Properties**

| Name | Description |
| --- | --- |
| baseUrl | The baseUrl used to perform requests. |

<a name="new_module_raiden-rpc--RaidenClient_new"></a>

#### new RaidenClient([rpcHost], [apiVersion])
A class that represents a raiden node. Holds information used to connect to it's rpc interface.

**Params**

- [rpcHost] <code>String</code> - the full raiden node hostname
- [apiVersion] <code>String</code> - the raiden api version

<a name="module_raiden-rpc--RaidenClient+customRequest"></a>

#### raidenClient.customRequest(method, uri, [...options])
Performs a manual API call on the Raiden node.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Params**

- method <code>String</code> - request method to use
- uri <code>String</code> - the api endpoint to call (relative to [RaidenClient#baseUrl](RaidenClient#baseUrl))
- [...options] <code>Object</code> - custom request options

**Example**  
```javascript
myNode.customRequest('PATCH', `/channels/${channelAddress}`, { body: { balance: amount } })
```
<a name="module_raiden-rpc--RaidenClient+getAddress"></a>

#### raidenClient.getAddress([options]) ⇒ <code>Promise</code>
Retrieves the Ethereum address associated with the node

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>String</code> - Ethereum address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-your-address)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+registerToken"></a>

#### raidenClient.registerToken(tokenAddress, [options]) ⇒ <code>Promise</code>
Registers a token by deploying a channel manager.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>String</code> - channel manager Ethereum address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#registering-a-token)  
**Params**

- tokenAddress <code>String</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getRegisteredTokens"></a>

#### raidenClient.getRegisteredTokens([options]) ⇒ <code>Promise</code>
Get a list of addresses of all registered tokens.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>String[]</code> - array of Ethereum addresses  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-traded-tokens)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getTokenPartners"></a>

#### raidenClient.getTokenPartners(tokenAddress, [options]) ⇒ <code>Promise</code>
Get a list of all partners you have non-settled channels with.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object[]</code> - array of objects containing channel_address and partner_address  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-partners-for-a-token)  
**Params**

- tokenAddress <code>String</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getChannel"></a>

#### raidenClient.getChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Query information about your channel.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-a-specific-channel)  
**Params**

- channelAddress <code>String</code> - Ethereum address
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getAllChannels"></a>

#### raidenClient.getAllChannels([options]) ⇒ <code>Promise</code>
Get a list of all non-settled channels.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about your channels  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-all-channels)  
**Params**

- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+openChannel"></a>

#### raidenClient.openChannel(partnerAddress, tokenAddress, initialBalance, [settleTimeout], [revealTimeout], [options]) ⇒ <code>Promise</code>
Creates a channel with a partner.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - objects containing information about your newly created channel  
**Reject**: <code>Error</code> - request error  
**See**

- [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#open-channel)
- [settleTimeout](https://raiden-network.readthedocs.io/en/stable/spec.html#channel-closing-and-settlement)
- [revealTimeout](https://raiden-network.readthedocs.io/en/stable/spec.html#safety-of-mediated-transfers)

**Params**

- partnerAddress <code>String</code> - Ethereum address of other Raiden node
- tokenAddress <code>String</code> - Ethereum address of token that will be transferred in
this channel
- initialBalance <code>Number</code> - Tokens to initially deposit
- [settleTimeout] <code>Number</code> - Number of blocks to wait for settlement after closing
this channel
- [revealTimeout] <code>Number</code> - Number of blocks to use for reveal timeout
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+closeChannel"></a>

#### raidenClient.closeChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Closes an open channel.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#close-channel)  
**Params**

- channelAddress <code>String</code> - Ethereum address of channel
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+settleChannel"></a>

#### raidenClient.settleChannel(channelAddress, [options]) ⇒ <code>Promise</code>
Settle a closed channel.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#settle-channel)  
**Params**

- channelAddress <code>String</code> - Ethereum address of channel
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+deposit"></a>

#### raidenClient.deposit(channelAddress, amount, [options]) ⇒ <code>Promise</code>
Deposit more tokens into a channel. Token to deposit was specified on channel creation.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - object containing information about your channel  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#deposit-to-a-channel)  
**Params**

- channelAddress <code>String</code> - Ethereum address of channel
- amount <code>Number</code> - number of tokens
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+joinNetwork"></a>

#### raidenClient.joinNetwork(tokenAddress, depositAmount, [numberOfChannels], [reserveDepositRatio], [options]) ⇒ <code>Promise</code>
Join an existing token network.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#connecting-to-a-token-network)  
**Params**

- tokenAddress <code>String</code> - Ethereum address of token
- depositAmount <code>Number</code> - Total number of tokens to deposit
- [numberOfChannels] <code>Number</code> <code> = 3</code> - Number of channels to open on the network
- [reserveDepositRatio] <code>Number</code> <code> = 0.4</code> - Ratio of tokens deposited that should be reserved for
future channel creation. The rest are distributed amongst the [numberOfChannels](numberOfChannels) opened.
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+leaveNetwork"></a>

#### raidenClient.leaveNetwork(tokenAddress, [onlyReceivingChannels], [options]) ⇒ <code>Promise</code>
Close all open channels on a token network. The promise will only fulfill once all blockchain
calls for closing/settling a channel have completed.

Important note. If no arguments are given then raiden will only close and settle channels
where your node has received transfers.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>String[]</code> - Ethereum addresses of all closed channels.  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#leaving-a-token-network)  
**Params**

- tokenAddress <code>String</code> - Ethereum address of token
- [onlyReceivingChannels] <code>boolean</code> <code> = true</code> - true if channels that have received transfers
should be closed, false if every channel should be closed.
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+sendTokens"></a>

#### raidenClient.sendTokens(tokenAddress, recipientAddress, amount, [transferId], [options]) ⇒ <code>Promise</code>
Transfer tokens to a recipient.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object</code> - object containing information about your transfer  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#initiating-a-transfer)  
**Params**

- tokenAddress <code>String</code> - Ethereum address of token
- recipientAddress <code>String</code> - Ethereum address of recipient
- amount <code>Number</code> - number of tokens to send
- [transferId] <code>Number</code> - integer identifier to attach to the transfer
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+makeTokenSwap"></a>

#### raidenClient.makeTokenSwap(tokenSwap, [options]) ⇒ <code>Promise</code>
Request a token swap to atomically exchange two tokens with a specified recipient.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps)  
**Params**

- tokenSwap <code>Object</code> - object representing the token swap
    - .identifier <code>Number</code> - Integer identifier to use for this swap
    - [.makerAddress] <code>String</code> - Ethereum address of the swap maker
    - .makerToken <code>String</code> - Ethereum address of token the maker wants to swap
    - .makerAmount <code>Number</code> - number of tokens the maker wants to swap
    - .takerAddress <code>String</code> - Ethereum address of the swap taker
    - .takerToken <code>String</code> - Ethereum address of token the taker will swap
    - .takerAmount <code>Number</code> - number of tokens the taker will swap
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+takeTokenSwap"></a>

#### raidenClient.takeTokenSwap(tokenSwap, [options]) ⇒ <code>Promise</code>
Accept a token swap to atomically exchange two tokens with a specified recipient.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: - no content  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#token-swaps)  
**Params**

- tokenSwap <code>Object</code> - object representing the token swap
    - .identifier <code>Number</code> - Integer identifier of the swap
    - .makerAddress <code>String</code> - Ethereum address of the swap maker
    - .makerToken <code>String</code> - Ethereum address of token the maker wants to swap
    - .makerAmount <code>Number</code> - number of tokens the maker wants to swap
    - [.takerAddress] <code>String</code> - Ethereum address of the swap taker
    - .takerToken <code>String</code> - Ethereum address of token the taker will swap
    - .takerAmount <code>Number</code> - number of tokens the taker will swap
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getNetworkEvents"></a>

#### raidenClient.getNetworkEvents([fromBlock], [options]) ⇒ <code>Promise</code>
Query for registry network events.

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-general-network-events)  
**Params**

- [fromBlock] <code>Number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getTokenEvents"></a>

#### raidenClient.getTokenEvents(tokenAddress, [fromBlock], [options]) ⇒ <code>Promise</code>
Query for all new channels opened for a token

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-token-network-events)  
**Params**

- tokenAddress <code>String</code> - Ethereum address of token
- [fromBlock] <code>Number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient+getChannelEvents"></a>

#### raidenClient.getChannelEvents(channelAddress, [fromBlock], [options]) ⇒ <code>Promise</code>
Query for events tied to a specific channel

**Kind**: instance method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Fulfill**: <code>Object[]</code> - array of objects containing information about each event  
**Reject**: <code>Error</code> - request error  
**See**: [Raiden docs](https://raiden-network.readthedocs.io/en/stable/rest_api.html#querying-channel-events)  
**Params**

- channelAddress <code>String</code> - Ethereum address of channel
- [fromBlock] <code>Number</code> - only get events that occurred after this block
- [options] <code>Object</code> - custom request options

<a name="module_raiden-rpc--RaidenClient.localNode"></a>

#### RaidenClient.localNode() ⇒ <code>Raiden</code>
Returns a new instance of [RaideNode](RaideNode) connecting to the default localhost node.

**Kind**: static method of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
<a name="module_raiden-rpc--RaidenClient..DEFAULT_RPC_HOST"></a>

#### RaidenClient~DEFAULT_RPC_HOST : <code>String</code>
**Kind**: inner constant of [<code>RaidenClient</code>](#exp_module_raiden-rpc--RaidenClient)  
**Default**: <code>http://127.0.0.1:5001/</code>  
