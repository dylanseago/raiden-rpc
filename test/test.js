/* eslint-disable no-console */
const chai = require('chai');
const ethAddress = require('ethereum-address');
const RaidenClient = require('../index.js');

const { expect } = chai;

const raidenEndpoints = ['http://localhost:5000', 'http://localhost:5001'];
const testnetToken = '0x0f114a1e9db192502e7856309cc899952b3db1ed';
const settleTimeout = 100;
const revealTimeout = 30;

function expectEthAddress(address) {
  expect(ethAddress.isAddress(address)).to.be.true;
}

function describeEach(message, arr, cb) {
  arr.forEach((elem, index) => {
    describe(`${message}[${index}]`, () => {
      cb(elem, index);
    });
  });
}

describe('RaidenClient', () => {
  const nodes = raidenEndpoints.map(ep => new RaidenClient(ep));

  describeEach('node', nodes, (node) => {
    describe('#getAddress()', () => {
      it('should return valid address', () =>
        node.getAddress().then((address) => {
          expectEthAddress(address);
          node.address = address;
        }));
    });

    describe('#getRegisteredTokens()', () => {
      it('should return testnetToken', () =>
        node.getRegisteredTokens().then((tokens) => {
          expect(tokens).to.include(testnetToken);
        }));
    });

    describe('#joinNetwork()', () => {
      it('should connect to testnetToken network', () =>
        node.joinNetwork(testnetToken, 40));
    });
  });

  const transferId = Date.now();
  const amountSent = 7;
  describe('#sendTokens', () => {
    it('node[0] should send tokens', () =>
      nodes[0].sendTokens(testnetToken, nodes[1].address, amountSent, transferId));
  });

  describe('#getTokenEvents', () => {
    let events;
    it('node[1] should query token events', () =>
      nodes[1].getTokenEvents(testnetToken).then((result) => { events = result; }));
    console.log(events);
  });

  describeEach('node', nodes, (node) => {
    describe('#leaveNetwork()', () => {
      it('should leave the testnetToken network', () =>
        node.leaveNetwork(testnetToken));
    });
  });

  describe.skip('#openChannel()', () => { // openChannel broken on parity -> https://github.com/raiden-network/raiden/issues/879
    it('node[0] should open channel with node[1]', () =>
      nodes[0].openChannel(nodes[1].address, testnetToken, 40, settleTimeout, revealTimeout)
        .then((resp) => {
          expectEthAddress(resp.channel_address);
          expect(resp.state).to.eql('open');
        }));
  });
});
